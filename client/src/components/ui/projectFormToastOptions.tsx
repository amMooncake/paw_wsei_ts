import type { ToastOptions } from 'react-toastify';
import { LuX } from 'react-icons/lu';

const toastConfig: ToastOptions = {
  position: 'bottom-center',
  hideProgressBar: true,
  progress: undefined,
  theme: 'light',
  icon: false,
  closeButton: ({ closeToast }) => <LuX className='absolute top-1 right-1 w-5 h-5 cursor-pointer hover:scale-110 transition-transform' onClick={closeToast} />
};

export const toastErrorStyle: ToastOptions = {
  ...toastConfig,
  className: 'border-2 border-b-4 border-red-500 !text-red-500 font-bold text-md',
};

export const toastSuccessStyle: ToastOptions = {
  ...toastConfig,
  className: 'border-2 border-b-4 border-green-500 !text-green-500 font-bold text-md',
};