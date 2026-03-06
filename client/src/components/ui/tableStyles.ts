export const tableStyles = {
  wrapper: 'max-w-full overflow-x-auto',
  table: 'w-full table-auto bg-white border-b-4 border-black',
  headRow: 'bg-yellow-300 [&>*]:p-2 [&>*]:border-2 [&>*]:border-zinc-900 [&>*]:font-black [&>*]:uppercase [&>*]:tracking-wide',
  bodyRow: 'even:bg-white odd:bg-zinc-200 [&>*]:p-2 [&>*]:border-2 [&>*]:border-black [&>*]:align-middle',
  actionsHeaderCell: 'w-px whitespace-nowrap',
  actionsCell: 'w-px whitespace-nowrap',
  actionsContainer: 'inline-flex gap-2',
} as const
