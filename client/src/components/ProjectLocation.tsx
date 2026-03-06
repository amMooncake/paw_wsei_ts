import NeuButton from './ui/NeuButtonBlue'
import { projectApi } from '../api/projectApi'

type ProjectLocationProps = {
  projectId: string | null
  onBack: () => void
}

export default function ProjectLocation({ projectId, onBack }: ProjectLocationProps) {
  const project = projectId ? projectApi.getById(projectId) : null

  return (
    <div className="notebook-grid min-h-screen w-full flex items-center justify-center p-8">
        
      <section className="w-full max-w-2xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-black uppercase tracking-wide">Project View</h1>
          <NeuButton className="bg-blue-300" onClick={onBack}>
            <p className="text-black">Back</p>
          </NeuButton>
        </div>

        {project && (
          <div className="grid gap-4">
            <div className="border-2 border-black p-3">
              <p className="text-xs uppercase font-bold">Id</p>
              <p className="font-mono break-all">{project.id}</p>
            </div>
            <div className="border-2 border-black p-3">
              <p className="text-xs uppercase font-bold">Name</p>
              <p className="font-semibold">{project.name}</p>
            </div>
            <div className="border-2 border-black p-3">
              <p className="text-xs uppercase font-bold">Description</p>
              <p>{project.description}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
