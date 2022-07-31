import '../styles/Main.scss'  
import React from 'react'
import {Space, DatePicker, Button, Alert} from 'antd'
import { useState, useEffect } from 'react';
const axios = require('axios');
const { RangePicker } = DatePicker;


export default function DayPicker() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState([])
  const [date, setDate] = useState([])
  const [error, setError] = useState('')
  const [parsedData, setParsedData] = useState([])

  async function getReport(data) {
    setResult([])
    setParsedData([])
    data.map((d) => {
      setParsedData(prev => [...prev,
        {name: d.content.slice(d.content.indexOf('Докладывает:') + 13, d.content.lastIndexOf('|') - 1), 
         dateStart: (d.content.slice(d.content.indexOf('В период с') + 'В период с'.length + 2, d.content.indexOf('] по ['))).replaceAll('/', '.'),
         dateEnd: (d.content.slice(d.content.indexOf('] по [') + '] по ['.length, d.content.indexOf(']:'))).replaceAll('/', '.'),
         checks: d.content.slice(d.content.indexOf('1.1 Проверка') + '1.1 Проверка'.length + 5, d.content.indexOf('1.2 Провалили') - 2),
         trained: d.content.slice(d.content.indexOf('1.4 Обучение') + '1.4 Обучение'.length + 5, d.content.indexOf('1.5 Экскурсия') - 2),
         excursions: d.content.slice(d.content.indexOf('1.5 Экскурсия') + '1.5 Экскурсия'.length + 4, d.content.indexOf('#2') - 3),
         steamId: d.content.slice(d.content.indexOf('steamid:') + 'steamid:'.length + 1, d.content.indexOf('steamid:') + '7656119910598994:'.length + 1 + 'steamid:'.length),
        }])
    })
  }
  useEffect(() => {
    if (date.length == 0) return
    var allTrained = 0;
    var allCheks = 0;
    var allExcursions = 0;
    var isTrue = false;
    var isTrue2 = false;
    var probel = parsedData.reduce((acc, cur) => acc.name.length > cur.name.length ? acc : cur)
    var report = 
      ` ${'```less'}\nОтчёт о проделанной работе тренеров с [${new Date(date[0]._d).toLocaleDateString()}] по [${new Date(date[1]._d).toLocaleDateString()}]\n\nОсновной состав:\n`
      parsedData.map((tr) => {
        tr.dateStart == new Date(date[0]._d).toLocaleDateString() ? isTrue = true : isTrue = false
        tr.dateEnd == new Date(date[1]._d).toLocaleDateString() ? isTrue2 = true : isTrue2 = false
        if (isTrue && isTrue2) {  
          allTrained += Number(tr.trained === "-" ? 0 : tr.trained)
          allCheks += Number(tr.checks === "-" ? 0 : tr.checks)
          allExcursions += Number(tr.excursions === "-" ? 0 : tr.excursions)
          tr.name = tr.name.slice(0, tr.name.indexOf('|')).length === 5 ? tr.name.slice(0, tr.name.indexOf('|')) + " " + tr.name.slice(tr.name.indexOf('|')) : tr.name
          report += tr.name + " ".repeat(probel.name.length + 2 - tr.name.length) + "| " + tr.steamId + ` [обучил ${tr.trained == '-' ? '0 ' : tr.trained.length == 1 ? tr.trained + " " : tr.trained} | проверил ${tr.checks == '-' ? '0 ' : tr.checks.length == 1 ? tr.checks + " " : tr.checks} | экскурсий ${tr.excursions == '-' ? '0 ' : tr.excursions.length == 1 ? tr.excursions + " " : tr.excursions}]` + '\n'
        }
      })
      report += '\n' + `Всего тренерским составом базы Анаксес обучено [${allTrained}], проверено [${allCheks}], экскурсий [${allExcursions}].${'\n```'}`
      setResult(report)
      // axios.post('http://localhost:5000/send', {report:report})
  }, [parsedData])
  

  async function getMessages() {
    if (date.length == 0) return setError('Заполните дату!')
    setError('')
    setLoading(true)
    await axios.get('https://api.swrpngg.site/get').then(res => {return getReport(res.data)}).finally(() => setLoading(false))
  }

  return (
    <Space style={{width:'100%'}} direction='vertical' size={12} className='DatePicker'>
      <RangePicker onChange={(date) => setDate(date)} />
      <Button onClick={() => getMessages()} type='primary' loading={loading ? true : false}>Получить отчёт</Button>
      {error ? <Alert type="error" message={error} showIcon /> : ''}
      {result.length
      ? <textarea className='area' value={result} onChange={(e) => setResult(e.target.value)} />
      : <div className='area' style={{background:'inherit'}}></div>
      }
    </Space>
  )
}
