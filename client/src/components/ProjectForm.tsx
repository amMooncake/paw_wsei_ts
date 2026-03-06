import { useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'react-toastify';

import { projectApi } from '../api/projectApi';
import { toastErrorStyle, toastSuccessStyle } from './ui/projectFormToastOptions';

import type { Project, ProjectForm } from '../models/project'
import { emptyForm } from "../models/project";

import NeuButton from './ui/NeuButtonBlue';
import Input from './ui/NeuInput';
import Textarea from './ui/NeuTextarea';

export default function ProjectForm({ setProjects }: { setProjects: Dispatch<SetStateAction<Project[]>> }) {
  const [createForm, setCreateForm] = useState<ProjectForm>(emptyForm)


  async function handleSubmit(): Promise<void> {
    if (createForm.name.trim() === '') {
      toast.error('Nazwa projektu nie może być pusta!', toastErrorStyle);
      return;
    }

    if (createForm.description.trim() === '') {
      toast.error('Opis projektu nie może być pusty!', toastErrorStyle);
      return;
    }

    await projectApi.create(createForm)

    toast.success('Projekt został dodany.', toastSuccessStyle)
    setCreateForm(emptyForm)
    setProjects(await projectApi.getAll())
  }

  return <>



    <form
      id='project-form'
      className='flex flex-col gap-2'
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
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