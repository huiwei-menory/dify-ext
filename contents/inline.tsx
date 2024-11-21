import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useState } from "react"
import * as XLSX from "xlsx"

export const config: PlasmoCSConfig = {
  matches: [
    "https://dify.hellotalk8.com/app/8be767c1-e992-4b69-acfa-494ac56fc0bd/*",
    "https://dify.hellotalk8.com/app/2bbc65a3-11bf-421b-904e-68f2ab2a2723/*",
    "https://dify.hellotalk8.com/app/0a17356c-ac99-4d04-b806-b8a28a6c9e27/*",
    "https://dify.hellotalk8.com/app/c63e1ca7-ce97-4db8-a1cc-38e19a78488e/*",
    "https://dify.hellotalk8.com/app/2e58bc57-0e90-4f38-b77b-8cf4400de514/*",
    "https://dify.hellotalk8.com/app/dfd01f8f-cc1d-4503-9f66-4977acc78480/*",
    "https://dify.hellotalk8.com/app/4bf5cbef-b098-4628-b503-0533c946362b/*",
    "https://dify.hellotalk8.com/app/b02c0df7-0a86-4bea-9b96-7ec2f73b2feb/*",
    "https://dify.hellotalk8.com/app/69e1fe5b-de4c-4302-b88b-69c381460443/*"
  ]
}

export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
  // 检查目标元素是否存在
  let target = document.querySelector(
    'div[class="flex justify-between p-4 pt-3 border-t border-divider-subtle"]'
  )

  if (!target) {
    // 如果目标元素未找到，使用 MutationObserver 进行监听
    const observer = new MutationObserver(() => {
      target = document.querySelector(
        'div[class="flex justify-between p-4 pt-3 border-t border-divider-subtle"]'
      )
      if (target) {
        console.log("目标元素已加载，触发注入")
        observer.disconnect() // 停止观察
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
  }

  return target
}

// Use this to optimize unmount lookups
export const getShadowHostId = () => "plasmo-inline-example-unique-id"

const PlasmoInline = () => {
  const [isUploading, setIsUploading] = useState(false) // 上传状态

  const selectApiKeyByUUID = () => {
    const url = window.location.href

    const uuid = getUUID()

    const apiKeyMap = {
      "8be767c1-e992-4b69-acfa-494ac56fc0bd": "app-rjuNJqBZKNvxlYxY5zDqtnkj",
      "2bbc65a3-11bf-421b-904e-68f2ab2a2723": "app-G05xtxKVX2oO3Fz8HyhR2Cpa", // 德语
      "0a17356c-ac99-4d04-b806-b8a28a6c9e27": "app-ktSXWnH3kWqkYqnlFNOy1W2z", // 法语
      "c63e1ca7-ce97-4db8-a1cc-38e19a78488e": "app-AvZQNHimn6lH2H8G1gvyezdw", // 韩语
      "2e58bc57-0e90-4f38-b77b-8cf4400de514": "app-UfpsXpSxk8gHbwqZR17Wf6yP", // 土耳其语
      "dfd01f8f-cc1d-4503-9f66-4977acc78480": "app-exx0PgJYoR40WjTb5fo8rbgt", // 日语
      "4bf5cbef-b098-4628-b503-0533c946362b": "app-PExLdIHEjVhkyWvgJ0B7dZzJ", // 墨西哥西语
      "b02c0df7-0a86-4bea-9b96-7ec2f73b2feb": "app-s00gW1UymuJKp8TTSOc5fETK", // 西班牙语
      "69e1fe5b-de4c-4302-b88b-69c381460443": "app-1a8u4KnIpc8ReVK0PR7LR0Vr" // 阿拉伯语
    }

    const apiKey = apiKeyMap[uuid] || "unknown"
    return apiKey
  }

  const getUUID = () => {
    const url = window.location.href
    const uuidMatch = url.match(/\/app\/([a-f0-9-]{36})\/configuration/)
    if (!uuidMatch) {
      return "unknown"
    }
    return uuidMatch[1]
  }

  const getInputKey = () => {
    const uuid = getUUID()
    const inputKeyMap = {
      "8be767c1-e992-4b69-acfa-494ac56fc0bd": "English_chat",
      "2bbc65a3-11bf-421b-904e-68f2ab2a2723": "English_dialogue", // 德语
      "0a17356c-ac99-4d04-b806-b8a28a6c9e27": "English_dialogue", // 法语
      "c63e1ca7-ce97-4db8-a1cc-38e19a78488e": "English_dialogue", // 韩语
      "2e58bc57-0e90-4f38-b77b-8cf4400de514": "English_dialogue", // 土耳其语
      "dfd01f8f-cc1d-4503-9f66-4977acc78480": "English_chat", // 日语
      "4bf5cbef-b098-4628-b503-0533c946362b": "English_chat", // 墨西哥西语
      "b02c0df7-0a86-4bea-9b96-7ec2f73b2feb": "English_chat", // 西班牙语
      "69e1fe5b-de4c-4302-b88b-69c381460443": "English_conversation" // 阿拉伯语
    }
    return inputKeyMap[uuid] || "unknown"
  }

  const translate = (chats: string[]): Promise<Record<string, string>> => {
    return new Promise((resolve, reject) => {
      // setTimeout(() => reject(new Error('请求超时')), 1000)
      fetch("https://dify.hellotalk8.com/v1/completion-messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${selectApiKeyByUUID()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: { [getInputKey()]: chats.join("\n") },
          response_mode: "blocking",
          user: "dify-ext"
        })
      })
        .then((v) => v.json())
        .then((v) => {
          const translated = {}
          const { answer } = v
          // NDJSON
          const items = answer.split("\n")
          for (const item of items) {
            if (!item) {
              continue
            }
            try {
              const jsonData = JSON.parse(item.trim())
              translated[jsonData.original] = jsonData.translated
            } catch (error) {
              console.error("解析 JSON 出错:", error, item)
            }
          }
          resolve(translated)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true) // 开始上传

      const unTranslateds = []

      try {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const data = e.target?.result
          if (data) {
            // 将 ArrayBuffer 转换为字节数组
            const binary = new Uint8Array(data as ArrayBuffer)
            const binaryString = Array.from(binary)
              .map((byte) => String.fromCharCode(byte))
              .join("")
            // 解析 Excel 文件
            const workbook = XLSX.read(binaryString, { type: "binary" })
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]
            const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 })

            const translatedMap = {}
            let chats = []
            let i = 0
            let j = 0
            for (const row of sheetData) {
              i++
              if (i === 1) {
                continue
              }
              if (!row[0]) {
                continue
              }
              let line = ""
              if (row[1]) {
                line = `${row[0]} ${row[1]}`
              } else {
                line = `${row[0]}`
              }

              chats.push(line)

              if (typeof row[0] === "number") {
                j++
                if (j != 1 && j % 5 === 1) {
                  console.log("j", j)
                  chats.pop()

                  let translated: Record<string, string> = {}
                  try {
                    translated = await translate(chats)
                    for (const key in translated) {
                      translatedMap[key] = translated[key]
                      delete translated[key]
                    }
                  } catch (error) {
                    console.error("解析 JSON 出错:", error)
                  }

                  for (const key in translated) {
                    unTranslateds.push([key, translated[key]])
                  }

                  chats = [[row[0]]]
                }
              }
            }

            // 如果最后一组聊天不为空，则进行翻译
            if (chats.length > 1) {
              let translated: Record<string, string> = {}
              try {
                translated = await translate(chats)
                for (const key in translated) {
                  translatedMap[key] = translated[key]
                  delete translated[key]
                }
              } catch (error) {
                console.error("解析 JSON 出错:", error)
              }

              for (const key in translated) {
                unTranslateds.push([key, translated[key]])
              }
            }

            const aoa = sheetData.map((row: any[], index: number) => {
              if (index === 0) {
                // 第一行为表头
                row.push("翻译")
              } else {
                if (row[1]) {
                  row.push(translatedMap[row[1]] || "未翻译")
                } else {
                  row.push("")
                }
              }

              return row
            })

            setIsUploading(false) // 上传完成

            const outWorkbook = XLSX.utils.book_new() // 创建工作簿

            // 下载 Excel 文件
            const outWorksheet = XLSX.utils.aoa_to_sheet(aoa) // 转换为工作表
            XLSX.utils.book_append_sheet(outWorkbook, outWorksheet, "Sheet1") // 添加工作表

            // 追加 Sheet2
            const outWorksheet2 = XLSX.utils.aoa_to_sheet(unTranslateds) // 转换为工作表
            XLSX.utils.book_append_sheet(outWorkbook, outWorksheet2, "Sheet2") // 添加工作表

            XLSX.writeFile(outWorkbook, file.name) // 下载 Excel 文件
          }
        }
        reader.readAsArrayBuffer(file)
      } catch (error) {
        console.error("解析 Excel 文件出错:", error)
      } finally {
        // 重置 input 值，确保后续可以重复触发 onChange
        event.target.value = ""
      }
    }
  }

  return (
    <div>
      <div
        style={{
          border: "1px solid red",
          textAlign: "center",
          margin: "1rem",
          padding: "2px 8px"
        }}>
        <label htmlFor="file-upload">
          {isUploading ? "处理中..." : "Excel 文件"}
        </label>
        <input
          id="file-upload"
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}

export default PlasmoInline
