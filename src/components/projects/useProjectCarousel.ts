import { useCallback, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { SelectedProject } from '../../data/projects';

type SwipeStart = {
  x: number;
  y: number;
};

const SWIPE_THRESHOLD = 42;

export function useProjectCarousel(projects: readonly SelectedProject[]) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? '');
  const swipeStartRef = useRef<SwipeStart | null>(null);
  const suppressClickRef = useRef(false);
  const selectedIndex = Math.max(
    0,
    projects.findIndex((project) => project.id === selectedProjectId),
  );
  const selectedProject = projects[selectedIndex];

  const selectByIndex = useCallback(
    (projectIndex: number) => {
      if (projects.length === 0) {
        return;
      }

      const normalizedIndex = (projectIndex + projects.length) % projects.length;
      setSelectedProjectId(projects[normalizedIndex].id);
    },
    [projects],
  );

  const selectPreviousProject = useCallback(() => {
    selectByIndex(selectedIndex - 1);
  }, [selectByIndex, selectedIndex]);

  const selectNextProject = useCallback(() => {
    selectByIndex(selectedIndex + 1);
  }, [selectByIndex, selectedIndex]);

  const beginSwipe = useCallback((event: PointerEvent<HTMLDivElement>) => {
    swipeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }, []);

  const endSwipe = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const swipeStart = swipeStartRef.current;
      swipeStartRef.current = null;

      if (!swipeStart) {
        return;
      }

      const deltaX = event.clientX - swipeStart.x;
      const deltaY = event.clientY - swipeStart.y;

      if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }

      suppressClickRef.current = true;

      if (deltaX < 0) {
        selectNextProject();
        return;
      }

      selectPreviousProject();
    },
    [selectNextProject, selectPreviousProject],
  );

  const cancelSwipe = useCallback(() => {
    swipeStartRef.current = null;
  }, []);

  const selectProject = useCallback((projectId: string) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    setSelectedProjectId(projectId);
  }, []);

  return {
    beginSwipe,
    cancelSwipe,
    endSwipe,
    selectedIndex,
    selectedProject,
    selectedProjectId,
    selectNextProject,
    selectPreviousProject,
    selectProject,
  };
}
