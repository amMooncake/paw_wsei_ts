import { useState, type Dispatch, type SetStateAction } from 'react';

import { projectApi } from '../api/projectApi';

import type { Project, ProjectForm } from '../models/project'
import { emptyForm } from "../models/project";



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
      <input
        className='border-2'
        type="text"
        value={createForm.name}
        placeholder="Nazwa projektu"
        onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })}
      />

      <textarea
        className='border-2'
        value={createForm.description}
        placeholder="Opis projektu"
        onChange={(event) => setCreateForm({ ...createForm, description: event.target.value })}
      />

      <button className='border-2' type="submit"> dodaj </button>
      {/* <button className='border-2' type="button" onClick={projectApi.logAll}> Wyświetl projekty </button> */}
    </form>
  </>
}