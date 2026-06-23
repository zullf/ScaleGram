import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PURPLE = '#6366F1';

export default function AnimatedProfileTabs({ tabs, activeTab, colors = {}, onChange }) {
  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = useMemo(
    () => Math.max(tabs.findIndex((tab) => tab.key === activeTab), 0),
    [activeTab, tabs]
  );
  const progress = useRef(new Animated.Value(activeIndex)).current;
  const tabWidth = containerWidth / Math.max(tabs.length, 1);
  const activeColor = colors.primary || PURPLE;
  const inactiveColor = colors.mutedText || '#6B7280';

  useEffect(() => {
    Animated.timing(progress, {
      toValue: activeIndex,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, progress]);

  const translateX = progress.interpolate({
    inputRange: tabs.map((_, index) => index),
    outputRange: tabs.map((_, index) => index * tabWidth),
  });

  return (
    <View
      style={[
        styles.tabsRow,
        {
          borderTopColor: colors.border || '#E5E7EB',
          borderBottomColor: colors.border || '#E5E7EB',
        },
      ]}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.72}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={isActive ? activeColor : inactiveColor}
            />
            <Text
              style={[
                styles.tabText,
                { color: isActive ? activeColor : inactiveColor },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}

      {containerWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              backgroundColor: activeColor,
              width: tabWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tabsRow: {
    height: 50,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 2,
  },
});
