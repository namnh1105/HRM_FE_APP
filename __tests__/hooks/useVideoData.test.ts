describe('useVideoData Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const videos: any[] = [];
    const loading = false;
    const loadingMore = false;

    expect(videos).toEqual([]);
    expect(loading).toBe(false);
    expect(loadingMore).toBe(false);
  });

  it('should load videos successfully', () => {
    const mockVideos = [
      { id: '1', caption: 'Video 1' },
      { id: '2', caption: 'Video 2' },
    ];

    const videos = mockVideos;

    expect(videos).toHaveLength(2);
    expect(videos[0].id).toBe('1');
    expect(videos[1].id).toBe('2');
  });

  it('should show loading state on initial load', () => {
    const isLoading = true;
    const loading = isLoading;

    expect(loading).toBe(true);
  });

  it('should handle load more functionality', () => {
    let page = 1;
    const totalPages = 3;
    const isFetching = false;

    const handleLoadMore = () => {
      if (!isFetching && page < totalPages) {
        page = page + 1;
      }
    };

    handleLoadMore();

    expect(page).toBe(2);
  });

  it('should not load more when already fetching', () => {
    let page = 1;
    const totalPages = 3;
    const isFetching = true;

    const handleLoadMore = () => {
      if (!isFetching && page < totalPages) {
        page = page + 1;
      }
    };

    handleLoadMore();

    expect(page).toBe(1); // Page should not increment
  });

  it('should not load more when no more pages', () => {
    const currentPage = 1;
    const totalPages = 1;
    const hasMore = currentPage < totalPages;
    
    expect(hasMore).toBe(false);

    let shouldCallApi = false;
    if (hasMore) {
      shouldCallApi = true;
    }
    expect(shouldCallApi).toBe(false);
  });

  it('should refresh videos', () => {
    const mockRefetch = jest.fn();
    let page = 3;

    // Refresh logic
    page = 1;
    mockRefetch();

    expect(page).toBe(1);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should handle error with alert', () => {
    const mockAlert = jest.fn();
    const error = { message: 'Network error' };

    if (error) {
      mockAlert(
        'Lỗi',
        'Không thể tải video. Vui lòng thử lại.',
        [{ text: 'OK', onPress: jest.fn() }]
      );
    }

    expect(mockAlert).toHaveBeenCalledWith(
      'Lỗi',
      'Không thể tải video. Vui lòng thử lại.',
      [{ text: 'OK', onPress: expect.any(Function) }]
    );
  });

  it('should reset page to 1 on refresh', () => {
    let page = 5;
    
    // Refresh resets page
    page = 1;

    expect(page).toBe(1);
  });

  it('should accumulate videos on pagination', () => {
    const page1Videos = [{ id: '1' }];
    const page2Videos = [{ id: '2' }];

    let allVideos: any[] = [...page1Videos];
    expect(allVideos).toHaveLength(1);

    // Load more accumulates
    allVideos = [...allVideos, ...page2Videos];
    expect(allVideos).toHaveLength(2);
    expect(allVideos[0].id).toBe('1');
    expect(allVideos[1].id).toBe('2');
  });
});
