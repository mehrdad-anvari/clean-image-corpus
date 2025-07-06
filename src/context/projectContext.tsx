'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ProjectContextType = {
  rootDirHandle: FileSystemDirectoryHandle | null;
  setRootDirHandle: React.Dispatch<React.SetStateAction<FileSystemDirectoryHandle | null>>;
  imagesDirHandle: FileSystemDirectoryHandle | null;
  setImagesDirHandle: React.Dispatch<React.SetStateAction<FileSystemDirectoryHandle | null>>;
  annotationsDirHandle: FileSystemDirectoryHandle | null;
  setAnnotationsDirHandle: React.Dispatch<React.SetStateAction<FileSystemDirectoryHandle | null>>;
  db: IDBDatabase | null;
  setDb: React.Dispatch<React.SetStateAction<IDBDatabase | null>>;
  isReady: boolean;
  setIsReady: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [rootDirHandle, setRootDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [imagesDirHandle, setImagesDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [annotationsDirHandle, setAnnotationsDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  return (
    <ProjectContext.Provider
      value={{
        rootDirHandle,
        setRootDirHandle,
        imagesDirHandle,
        setImagesDirHandle,
        annotationsDirHandle,
        setAnnotationsDirHandle,
        db,
        setDb,
        isReady,
        setIsReady,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
