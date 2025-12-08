import { useState, useRef } from 'react';
import { ViewToken } from 'react-native';

export const useVideoVisibility = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null) {
        setCurrentIndex(index);
      }
    }
  }).current;

  return {
    currentIndex,
    viewabilityConfig: viewabilityConfig.current,
    onViewableItemsChanged,
  };
};
