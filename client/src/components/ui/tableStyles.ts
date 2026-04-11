export const tableStyles = {
  wrapper: 'max-w-full overflow-x-auto',
  table: 'w-full table-auto bg-white dark:bg-zinc-900 border-b-4 border-black dark:border-white transition-colors',
  headRow: 'bg-yellow-300 dark:bg-yellow-600 [&>*]:p-2 [&>*]:border-2 [&>*]:border-zinc-900 dark:[&>*]:border-zinc-100 [&>*]:font-black [&>*]:uppercase [&>*]:tracking-wide dark:text-white',
  bodyRow: 'even:bg-white odd:bg-zinc-200 dark:even:bg-zinc-900 dark:odd:bg-zinc-800 dark:text-white [&>*]:p-2 [&>*]:border-2 [&>*]:border-black dark:[&>*]:border-zinc-400 [&>*]:align-middle',
  actionsHeaderCell: 'w-px whitespace-nowrap',
  actionsCell: 'w-px whitespace-nowrap',
  actionsContainer: 'inline-flex gap-2',
} as const
