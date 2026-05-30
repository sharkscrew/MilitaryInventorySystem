import type { ChangeEvent, FC } from "react"

interface FloatingLabelInputProps {
    label: string;
    type: 'text' | 'date' | 'password';
    name: string;
    value?: string | any
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void
    newLabelClassName?: string;
    labelClassName?: string;
    newInputClassName?: string;
    inputClassName?: string;
    required?: boolean;
    autoFocus?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    errors?: string[] | string;
}

const FloatingLabelInput: FC<FloatingLabelInputProps> = ({
    label,
    type,
    name,
    value,
    onChange,
    newLabelClassName,
    labelClassName,
    newInputClassName,
    inputClassName,
    required,
    autoFocus,
    disabled,
    readOnly,
    errors }) => {
    const errorList = Array.isArray(errors) ? errors : errors ? [errors] : [];
    return (
        <>
            <div className="relative">
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    style={{ WebkitBoxShadow: '0 0 0px 1000px #1e1c1a inset', WebkitTextFillColor: 'white', caretColor: 'white' }}
                    className={`${newInputClassName
                        ? newInputClassName : `
        block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-lg border border-white/20 appearance-none focus:border-[#10b981] focus:outline-none focus:ring-0 peer
        ${type === 'date' ? 'pr-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer' : ''} ${inputClassName}`}
        `}
                    placeholder=" "
                    autoFocus={autoFocus}
                    disabled={disabled}
                    readOnly={readOnly}
                />
                <label
                    htmlFor={name}
                    className={`${newLabelClassName
                        ? newLabelClassName
                        : `absolute pointer-events-none text-sm text-slate-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-[#1e1c1a] px-2
                            peer-focus:px-2 peer-focus:text-[#10b981]
                            peer-placeholder-shown:scale-100
                            peer-placeholder-shown:top-1/2
                            peer-placeholder-shown:-translate-y-1/2
                            peer-focus:top-2
                            peer-focus:scale-75
                            peer-focus:-translate-y-4
                            rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto inset-s-1 ${labelClassName}`
                        }`}
                >
                    {label}
                    {required && (<span className="text-red-500 ml-1">*</span>)}
                </label>
            </div>
            {errorList.length > 0 && (
                <div className="mt-1">
                    {errorList.map((err, index) => (
                        <p key={index} className="text-red-500 text-xs">
                            {err}
                        </p>
                    ))}
                </div>
            )}
        </>
    );
};

export default FloatingLabelInput;