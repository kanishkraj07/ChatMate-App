import { Button, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { clsx } from 'clsx';


export interface DialogBoxProps {
    isOpen: boolean;
    setIsOpen: (T: boolean) => void;
    children?: JSX.Element;
    isCenter?: boolean;
}

const DialogBox = ({isOpen, setIsOpen, isCenter, children}: DialogBoxProps) => {

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }

  return (
    <>
      <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={close}>
        
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        
        <div className={clsx("fixed inset-0 flex w-screen items-center justify-center p-4", isCenter && "bottom-[50%]")}>
        
            <DialogPanel
              transition
              className="w-full max-w-fit rounded-xl rounded-bl-none rounded-br-none bg-primary-bg-30 p-3 backdrop-blur-2xl  border border-[rgba(255,255,255,0.2)] duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              {children}
            </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

export default DialogBox;
