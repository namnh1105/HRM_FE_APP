import { useState, useRef, useCallback } from 'react';
import {
  useRegisterFaceMutation,
  useLazyGetRegisterFaceJobStatusQuery,
  type JobStatus,
  type FaceRegisterJobResult,
} from '../store/api/attendanceApi';

/** Polling interval in ms */
const POLL_INTERVAL = 2000;
/** Maximum polling time before timeout (ms) */
const POLL_TIMEOUT = 120_000; // 2 phút

export interface RegisterFacePollingState {
  /** Bước hiện tại */
  phase: 'idle' | 'uploading' | 'polling' | 'completed' | 'failed';
  /** Trạng thái job từ server */
  jobStatus: JobStatus | null;
  /** Job ID để FE theo dõi */
  jobId: string | null;
  /** Kết quả khi completed */
  result: FaceRegisterJobResult | null;
  /** Thông báo lỗi */
  error: string | null;
  /** Mô tả tiến trình từ server */
  progress: string | null;
}

const INITIAL_STATE: RegisterFacePollingState = {
  phase: 'idle',
  jobStatus: null,
  jobId: null,
  result: null,
  error: null,
  progress: null,
};

/**
 * Hook xử lý đăng ký khuôn mặt với Redis queue polling.
 *
 * Flow:
 * 1. Gọi PUT /register-face → nhận jobId ngay lập tức
 * 2. Polling GET /register-face/status/{jobId} mỗi 2s
 * 3. Dừng khi status = completed | failed | timeout
 */
export function useRegisterFacePolling() {
  const [state, setState] = useState<RegisterFacePollingState>(INITIAL_STATE);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [registerFace] = useRegisterFaceMutation();
  const [fetchJobStatus] = useLazyGetRegisterFaceJobStatusQuery();

  /** Dọn dẹp timer */
  const clearTimers = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /** Bắt đầu polling */
  const startPolling = useCallback(
    (jobId: string) => {
      clearTimers();

      setState((prev) => ({
        ...prev,
        phase: 'polling',
        jobStatus: 'pending',
        progress: 'Đang chờ xử lý...',
      }));

      // Timeout tổng
      timeoutRef.current = setTimeout(() => {
        clearTimers();
        setState((prev) => ({
          ...prev,
          phase: 'failed',
          error: 'Quá thời gian chờ xử lý. Vui lòng thử lại sau.',
        }));
      }, POLL_TIMEOUT);

      // Poll interval
      const poll = async () => {
        try {
          const res = await fetchJobStatus(jobId, false).unwrap();
          const data = res.data;

          if (!data) return;

          const { status, result, error, progress } = data;

          if (status === 'completed') {
            clearTimers();
            setState({
              phase: 'completed',
              jobStatus: 'completed',
              jobId,
              result: result ?? null,
              error: null,
              progress: null,
            });
            return;
          }

          if (status === 'failed') {
            clearTimers();
            setState({
              phase: 'failed',
              jobStatus: 'failed',
              jobId,
              result: null,
              error: error ?? 'Đăng ký khuôn mặt thất bại.',
              progress: null,
            });
            return;
          }

          // pending | processing → cập nhật progress
          setState((prev) => ({
            ...prev,
            jobStatus: status,
            progress: progress ?? (status === 'processing' ? 'Đang phân tích khuôn mặt...' : 'Đang chờ xử lý...'),
          }));
        } catch {
          // Lỗi network → vẫn tiếp tục poll, không dừng ngay
        }
      };

      // Poll ngay lần đầu
      poll();
      pollingRef.current = setInterval(poll, POLL_INTERVAL);
    },
    [fetchJobStatus, clearTimers],
  );

  /** Hàm chính: upload video → nhận jobId → bắt đầu polling */
  const submitRegistration = useCallback(
    async (videoUri: string, employeeId: string) => {
      try {
        // Reset
        setState({
          ...INITIAL_STATE,
          phase: 'uploading',
        });

        // 1. Upload video → nhận jobId ngay
        const res = await registerFace({ videoUri, employeeId }).unwrap();

        if (!res.success || !res.data?.jobId) {
          setState({
            ...INITIAL_STATE,
            phase: 'failed',
            error: res.message || 'Không thể gửi yêu cầu đăng ký.',
          });
          return;
        }

        const jobId = res.data.jobId;

        setState((prev) => ({
          ...prev,
          jobId,
        }));

        // 2. Bắt đầu polling
        startPolling(jobId);
      } catch (error: any) {
        const msg =
          error?.data?.message ??
          error?.data?.errors?.[0] ??
          error?.message ??
          'Có lỗi xảy ra khi gửi yêu cầu.';
        setState({
          ...INITIAL_STATE,
          phase: 'failed',
          error: msg,
        });
      }
    },
    [registerFace, startPolling],
  );

  /** Reset về trạng thái ban đầu */
  const reset = useCallback(() => {
    clearTimers();
    setState(INITIAL_STATE);
  }, [clearTimers]);

  return {
    ...state,
    submitRegistration,
    reset,
    /** true khi đang upload hoặc polling */
    isProcessing: state.phase === 'uploading' || state.phase === 'polling',
  };
}
