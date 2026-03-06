import NeuButton from './ui/NeuButtonBlue'
import { projectApi } from '../api/projectApi'
import type { Project } from '../models/project'
import { tableStyles } from './ui/tableStyles'

type ProjectLocationProps = {
    projectId: string | null
    onBack: () => void
}

const heading2Style = "text-1xl font-black uppercase tracking-wide" as const

export default function ProjectLocation({ projectId, onBack }: ProjectLocationProps) {
    const project = projectId ? projectApi.getById(projectId) : null

    return (
        <div className="notebook-grid min-h-screen w-full flex justify-center px-10 pt-20">
            <section className="w-full max-w-5xl flex flex-col items-center gap-5">
                <div className="relative w-full flex items-center justify-center">
                    <h1 className="text-2xl font-black uppercase tracking-wide">Info Projektu</h1>
                    <NeuButton className="absolute right-0 bg-blue-300" onClick={onBack}>
                        <p className="text-black">Wróć</p>
                    </NeuButton>
                </div>

                {project && (
                    <>
                        <ProjectInfo project={project} />

                        <div className="flex flex-col w-full text-left gap-5">
                            <StoryTable header="Robię" headerClassName="bg-blue-300" />

                            <StoryTable header="Kiedyś się tym zajme" headerClassName="bg-yellow-300" />

                            <StoryTable header="Zrobione" headerClassName="bg-green-300" />

                        </div>

                    </>

                )}
            </section>
        </div >
    )
}

function StoryTable({header, headerClassName }: { header?: string, headerClassName?: string }) {
    return (
        <div>
            <h2 className={heading2Style}> {header} </h2>
            <table className={tableStyles.table}>
                <thead>
                    <tr className={`${tableStyles.headRow} ${headerClassName}`}>
                        <th>id</th>
                        <th>Nazwa</th>
                        <th>Opis</th>
                        <th className={tableStyles.actionsHeaderCell}>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className={tableStyles.bodyRow}>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr className={tableStyles.bodyRow}>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </ div>
    )
}



function ProjectInfo({ project }: { project: Project }) {
    return <div className="grid grid-cols-3 gap-2 w-full">
        <Box boxName="Id">
            <p className="font-mono break-all">{project.id}</p>
        </Box>
        <Box boxName="Nazwa">
            <p className="font-semibold">{project.name}</p>
        </Box>
        <Box boxName="Opis">
            <p>{project.description}</p>
        </Box>
    </div>

}

function Box({ children, boxName }: { children: React.ReactNode; boxName: string }) {
    return <div className="border-2 border-black p-3">
        <p className="text-xs uppercase font-bold">{boxName}</p>
        {children}
    </div>
}
