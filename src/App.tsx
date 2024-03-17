import React, { Fragment, useEffect, useState } from "react";
import { Route, Routes } from "react-router";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import ChatPage from "./components/ChatPage/ChatPage";
import Colab from "./components/Colab/Colab";
import Login from "./components/Login/Login";
import { useWebSocketContext } from "./hooks";
import { Dialog, Transition } from '@headlessui/react'
import { ReadyState } from 'react-use-websocket';

const App: React.FC = () => {
  const { readyState } = useWebSocketContext();
  let [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (readyState !== ReadyState.OPEN) {
      setIsOpen(true)
    }else {
      setIsOpen(false)
    }
  }, [readyState]);

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    Trying to reconnect ... ⏳
                  </Dialog.Title>
                  <div className="mt-3">
                    <p className="text-sm text-gray-500">
                    Please be patient as we work to restore connection. Your data and services will be available shortly. Thank you for your understanding. ❤️
                    </p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:mode/:userid" element={<ChatPage />} />
            <Route path="/docs/:id" element={<Colab />} />
          </Routes>
        </div>
      </Router>
    </>
  );
};

export default App;
