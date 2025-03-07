"use client"

import type React from "react"

import OpenAI from "openai"
import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import Markdown from "react-markdown"

export default function ChatUI() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello there!", sender: "bot" },
    { id: 2, text: "Hi! How can I help you today?", sender: "bot" },
    { id: 3, text: "I need some information about your services.", sender: "user" },
  ])
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localhost:8765/", {mode: "cors"})
      const data = await response.json()
      console.log(data)
    }

    fetchData()
  }, [])

  const deepseek = new OpenAI({
    baseURL: "https://api.deepseek.com/v1",
    apiKey: process.env.DEEPSEEK_API_KEY,
    dangerouslyAllowBrowser: true
  })


  async function getResponse(message: string) {
    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: message }],
    })
    return completion.choices[0].message.content
  }
  
  const chatWindowRef = useRef(null)
  const textareaRef = useRef(null)
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setMessages([...messages, { id: Date.now(), text: inputValue, sender: "user" }])
      setInputValue("")
      const response = await getResponse(inputValue)
      if (response) {
        setMessages([...messages, { id: Date.now(), text: response, sender: "bot" }])
      }
    }
  }

  const handleShift = (e: React.KeyboardEvent) => { 
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return
      }
      e.preventDefault()
      handleSubmit(e)
    }
  }

  useEffect(() => {
    if (chatWindowRef.current) {
      (chatWindowRef.current as HTMLElement).scrollTop = (chatWindowRef.current as HTMLElement).scrollHeight
    }
    if (textareaRef.current) {
      (textareaRef.current as HTMLTextAreaElement).style.height = "auto";
      (textareaRef.current as HTMLTextAreaElement).style.height = `${Math.min((textareaRef.current as HTMLTextAreaElement).scrollHeight, 200)}px`
    }
  }, [messages])

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="flex flex-col w-full max-w-[800px] h-screen bg-white shadow-lg">
        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatWindowRef}>
          {messages.map((message) => (

            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} whitespace-pre-wrap`}>
              {message.sender === "user" ? (
                <div
                  className={`max-w-[70%] p-3 rounded-lg break-words bg-blue-500 text-white rounded-br-none`}
                >
                  {message.text}
                </div>
              ) : (
                <div
                  className={`p-3 break-words text-gray-800 rounded-bl-none`}
                >
                  <Markdown>{message.text}</Markdown>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} onKeyDown={handleShift} className="flex gap-2 items-end">
            <textarea
              value={inputValue}
              ref={textareaRef}
              onChange={(e) => {
                setInputValue(e.target.value)
                // Auto-resize the textarea
                e.target.style.height = "auto"
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`
              }}
              onFocus={(e) => {
                // Set initial height when focused
                e.target.style.height = "auto"
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`
              }}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 p-2  rounded-md focus:outline-none  resize-none min-h-[40px] max-h-[200px] overflow-y-auto"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
