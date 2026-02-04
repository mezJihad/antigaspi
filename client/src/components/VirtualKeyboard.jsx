import React, { useState, useRef, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { Keyboard as KeyboardIcon, X } from "lucide-react";

/**
 * A wrapper around react-simple-keyboard that provides an Arabic layout toggle.
 * 
 * Props:
 * - onChange: (input: string) => void
 * - inputName: string (unique identifier for the input being edited)
 * - value: string (current value)
 * - layout: "default" | "shift" (optional, managed internally if not passed)
 */
const VirtualKeyboard = ({ onChange, value, inputName, onClose }) => {
    const keyboard = useRef();
    const [layoutName, setLayoutName] = useState("default");

    // Arabic Layout Definition
    const arabicLayout = {
        default: [
            "ذ 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
            "{tab} ض ص ث ق ف غ ع ه خ ح ج د \\",
            "{lock} ش س ي ب ل ا ت ن م ك ط {enter}",
            "{shift} ئ ء ؤ ر لا ى ة و ز ظ {shift}",
            "{space}"
        ],
        shift: [
            "ّ ! @ # $ % ^ & * ) ( _ + {bksp}",
            "{tab} َ ً ُ ٍ ْ ِ ~ ‘ { } |",
            "{lock} ِ ٍ ] [ “ , . < > ؟ {enter}",
            "{shift} ~ ْ { } ّ ! @ # $ % ^ & * ) ( _ + {shift}",
            "{space}"
        ]
    };

    const onKeyPress = (button) => {
        if (button === "{shift}" || button === "{lock}") {
            handleShift();
        }
    };

    const handleShift = () => {
        const newLayoutName = layoutName === "default" ? "shift" : "default";
        setLayoutName(newLayoutName);
    };

    const onChangeInput = (input) => {
        onChange(input);
    };

    return (
        <div className="fixed bottom-0 left-0 w-full bg-gray-100 border-t border-gray-300 shadow-xl z-50 p-4 animate-slide-up">
            <div className="flex justify-between items-center mb-2 container mx-auto max-w-4xl">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <KeyboardIcon size={16} /> Clavier Arabe Virtuel
                </span>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition" title="Fermer">
                    <X size={20} className="text-gray-600" />
                </button>
            </div>
            <div className="container mx-auto max-w-4xl direction-ltr">
                <Keyboard
                    keyboardRef={r => (keyboard.current = r)}
                    layoutName={layoutName}
                    layout={arabicLayout}
                    onChange={onChangeInput}
                    onKeyPress={onKeyPress}
                    inputName={inputName}
                // Sync the internal state of keyboard with the external value
                // This is tricky with simple-keyboard if multiple inputs share it, 
                // but here we instantiate one per view or mount/unmount.
                // The library generally keeps its own state. 
                // To force sync, we use setInput.

                />
            </div>
        </div>
    );
};

export default VirtualKeyboard;
