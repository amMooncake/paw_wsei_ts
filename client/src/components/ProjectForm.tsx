import { useState, type Dispatch, type SetStateAction } from 'react';

import { projectApi } from '../api/projectApi';
import Input from './ui/NeuInput';
import Textarea from './ui/NeuTextarea';

import type { Project, ProjectForm } from '../models/project'
import { emptyForm } from "../models/project";
import NeuButton from './ui/NeuButtonBlue';



export default function ProjectForm({ setProjects }: { setProjects: Dispatch<SetStateAction<Project[]>> }) {

  const [createForm, setCreateForm] = useState<ProjectForm>(emptyForm)

  function handleSubmit(event: React.ChangeEvent<HTMLFormElement>): void {
    event.preventDefault()
    projectApi.create(createForm)

    setCreateForm(emptyForm)
    setProjects(projectApi.getAll())
  }

  return <>

    <form id='project-form' className='flex flex-col gap-2' onSubmit={handleSubmit}>
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

      <NeuButton type="submit" className='bg-blue-700 text-xl font-bold'>
        Dodaj
      </NeuButton>
      {/* <button className='border-2' type="button" onClick={projectApi.logAll}> Wyświetl projekty </button> */}
    </form>
  </>
}