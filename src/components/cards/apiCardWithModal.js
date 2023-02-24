import React, {useState} from "react";

const ApiCardWithModal = (props) => {
    const [showModal, setShowModal] = useState(false);
    const { buttonLabel, clickFunction, halfOpacity, children } = props;

    const clickAndClose = () => {
        clickFunction();
        setShowModal(false);
    };


    return (
        <div className="grid grid-cols-1 rounded-lg border border-gray-600">
            <button
                className={
                    "w-full h-20 rounded-lg text-white " + 
                    ((halfOpacity !== true) ? "bg-orange-700 " : "bg-orange-700/50 ") +
                    ((halfOpacity !== true) ? "hover:bg-orange-800" : "hover:bg-orange-800/50")
                }
                onClick={() => setShowModal(!showModal)}
            >
                {buttonLabel}
            </button>
            {showModal &&
            <div className="
                overflow-y-auto
                overflow-x-hidden
                fixed
                top-0
                right-0
                left-0
                z-50
                w-full
                md:inset-0
                h-modal
                md:h-full"
            >
                <div className="
                    justify-center
                    items-center
                    flex
                    overflow-x-hidden
                    overflow-y-auto
                    fixed
                    inset-0
                    z-50
                    outline-none
                    focus:outline-none"
                >
                    <div className="relative w-auto my-6 mx-auto max-w-3xl">
                    {/*content*/}
                        <div className="bg-gray-900 border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                        {/*header*/}
                            <div className="bg-gray-900 flex items-start justify-between p-5 rounded-t">
                                <h3 className="text-3xl font-semibold">
                                    {buttonLabel} inputs
                                </h3>
                                <button
                                    className="p-1 ml-auto bg-transparent border-0 text-white float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                    onClick={() => setShowModal(false)}
                                >
                                    ×

                                </button>
                            </div>
                            {/*body*/}
                            <div className="bg-gray-900 relative p-6 flex-auto">
                                {children}
                            </div>
                            {/*footer*/}
                            <div className="bg-gray-900 grid justify-items-stretch p-6 rounded-b">
                                <button
                                    className="
                                        bg-emerald-500
                                        text-white
                                        active:bg-emerald-600
                                        font-bold
                                        text-sm
                                        px-6
                                        py-3
                                        rounded
                                        shadow
                                        hover:shadow-lg
                                        outline-none
                                        focus:outline-none
                                        mr-1
                                        mb-1
                                        ease-linear
                                        transition-all
                                        duration-150"
                                    type="button"
                                    onClick={clickAndClose}
                                >
                                    {buttonLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }
        </div>
    );
};

export default ApiCardWithModal;