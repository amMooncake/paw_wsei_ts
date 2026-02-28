import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'react-toastify';
import { LuX } from "react-icons/lu";

import { projectApi } from '../api/projectApi';

import type { Project, ProjectForm } from '../models/project'
import { emptyForm } from "../models/project";

import NeuButton from './ui/NeuButtonBlue';
import Input from './ui/NeuInput';
import Textarea from './ui/NeuTextarea';

export default function ProjectForm({ setProjects }: { setProjects: Dispatch<SetStateAction<Project[]>> }) {
  const [createForm, setCreateForm] = useState<ProjectForm>(emptyForm)


  const handleSubmit = useCallback((): void => {
    if (createForm.name.trim() === '') {
      // toast.error('Nazwa projektu nie może być pusta!')
      toast.error('Nazwa projektu nie może być pusta!', {
        position: "bottom-center",
        hideProgressBar: true,
        progress: undefined,
        theme: "light",
        className: 'border-2 border-b-4 border-red-500 !text-red-500 font-bold text-md',
        icon: false,
        closeButton: ({ closeToast }) => <LuX className='absolute top-1 right-1 w-5 h-5 cursor-pointer hover:scale-110 transition-transform' onClick={closeToast} />
      });
      return;
    }

    if (createForm.description.trim() === '') {
      toast.error('Opis projektu nie może być pusty!', {
        position: "bottom-center",
        hideProgressBar: true,
        progress: undefined,
        theme: "light",
        className: 'border-2 border-b-4 border-red-500 !text-red-500 font-bold text-md',
        icon: false,
        closeButton: ({ closeToast }) => <LuX className='absolute top-1 right-1 w-5 h-5 cursor-pointer hover:scale-110 transition-transform' onClick={closeToast} />
      });
      return;
    }

    projectApi.create(createForm)

    toast.success('Projekt został dodany.', {
        position: "bottom-center",
        hideProgressBar: true,
        progress: undefined,
        theme: "light",
        className: 'border-2 border-b-4 border-green-500 !text-green-500 font-bold text-md',
        icon: false,
        closeButton: ({ closeToast }) => <LuX className='absolute top-1 right-1 w-5 h-5 cursor-pointer hover:scale-110 transition-transform' onClick={closeToast} />
      })
    setCreateForm(emptyForm)
    setProjects(projectApi.getAll())

  }, [createForm, setProjects]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSubmit();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);

  }, [handleSubmit]);

  return <>



    <form
      id='project-form'
      className='flex flex-col gap-2'
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <Input
        type="text"
        value={createForm.name}
        placeholder="Nazwa projektu"
        onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })}
      />

      <Textarea
        value={createForm.description}
        placeholder="Opis projektu"
        onChange={(event) => setCreateForm({ ...createForm, description: event.target.value })}
      />

      <NeuButton type='submit' className='bg-blue-700 text-xl font-bold'>
        Dodaj
      </NeuButton>
      {/* <button className='border-2' type="button" onClick={projectApi.logAll}> Wyświetl projekty </button> */}
    </form>
  </>
}