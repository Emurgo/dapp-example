import React, {useState} from "react";

const InputModal = (props) => {
  const [showModal, setShowModal] = useState(false);
  const { buttonLabel, children } = props
  return (
    <div className="grid justify-items-center pb-2">
      <button className="block text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-gray-600 hover:bg-gray-700 focus:ring-gray-800" type="button"
              onClick={() => setShowModal(!showModal)} >
        {buttonLabel}
      </button >
      {showModal &&
        <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full">
          <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
          >
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="bg-gray-900 border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="bg-gray-900 flex items-start justify-between p-5 rounded-t">
                  <h3 className="text-3xl font-semibold">
                    Inputs
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
                <div className="bg-gray-900 flex items-center justify-end p-6 rounded-b">
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>}
    </div>
  );
};

export default InputModal;