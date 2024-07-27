import { Checkbox } from '@headlessui/react'
import { useState } from 'react'

export interface CheckBoxProps {
    check: boolean;
    setCheck: (T: boolean) => void;
}

const  CheckBox = ({check, setCheck}: CheckBoxProps) => {

  return (
    <Checkbox
      checked={check}
      onChange={setCheck}
      className="group block size-6 rounded border bg-transaparent data-[checked]:bg-primary-blue cursor-pointer"
    >
      <svg className="stroke-primary-slate opacity-0 group-data-[checked]:opacity-100" viewBox="0 0 14 14" fill="none">
        <path d="M3 8L6 11L11 3.5" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Checkbox>
  )
}

export default CheckBox;