import '../styles/Main.scss'  
import React from 'react'
import {Space, DatePicker, Button, Alert, Input} from 'antd'
import { useState, useEffect } from 'react';
import Search from 'antd/lib/transfer/search';
const axios = require('axios');
const { RangePicker } = DatePicker;


export default function DayPicker() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState([])
  const [date, setDate] = useState([])
  const [error, setError] = useState('')
  const [parsedData, setParsedData] = useState([])
  const [copy, setCopy] = useState(false)
  const [exceptions, setExceptions] = useState([])
  const [except, setExcept] = useState('')
  const [steamIdMatched, setSteamIdMatched] = useState([])


  async function getReport(data) {
    setResult([])
    setParsedData([])
    data.map((d) => {
      setParsedData(prev => [...prev,
        {
         name: d.content.slice(d.content.indexOf('Докладывает:') + 13, d.content.lastIndexOf('|') - 1), 
         dateStart: (d.content.slice(d.content.indexOf('В период с') + 'В период с'.length + 2, d.content.indexOf('] по ['))).replaceAll('/', '.'),
         dateEnd: (d.content.slice(d.content.indexOf('] по [') + '] по ['.length, d.content.indexOf(']:'))).replaceAll('/', '.'),
         checks: d.content.slice(d.content.indexOf('1.1 Проверка') + '1.1 Проверка'.length + 5, d.content.indexOf('1.2 Провалили') - 2),
         trained: d.content.slice(d.content.indexOf('1.4 Обучение') + '1.4 Обучение'.length + 5, d.content.indexOf('1.5 Экскурсия') - 2),
         excursions: d.content.slice(d.content.indexOf('1.5 Экскурсия') + '1.5 Экскурсия'.length + 4, d.content.indexOf('1.6 Испытание') - 2),
         challenges: d.content.slice(d.content.indexOf('1.6 Испытание') + '1.6 Испытание'.length + 4, d.content.indexOf('Проведено на текущем звании') - 6),
         steamId: d.content.slice(d.content.indexOf('steamid:') + 'steamid:'.length + 1, d.content.indexOf('steamid:') + '7656119910598994:'.length + 1 + 'steamid:'.length),
        }])
    })
    setParsedData(prev => prev.filter((tr) => tr.dateStart === new Date(date[0]._d).toLocaleDateString() ? true : false).filter((tr) => tr.challenges.length < 4 || tr.excursions.length < 4))
  }
  useEffect(() => {
    if (date.length == 0) return
    if (parsedData.length == 0) {return setError(`Отчёты не найдены в диапозоне от ${new Date(date[0]._d).toLocaleDateString()} до ${new Date(date[1]._d).toLocaleDateString()}`)}
    setSteamIdMatched([])
    setError('')

    var allTrained = 0;
    var allCheks = 0;
    var allExcursions = 0;
    var allChallenges = 0;

    parsedData.map((tr) => {
      if (exceptions.filter((ex) => tr.name.toLowerCase().includes(ex.toLowerCase()) ? true : false).length > 0) {return}
        setSteamIdMatched(prev => [...prev, tr.steamId])
    })
    console.log(parsedData)

    var steamIdMatchedUnique = [...new Set(steamIdMatched)]

    var probel = parsedData.reduce((acc, cur) => {
      if (exceptions.filter((ex) => acc.name.toLowerCase().includes(ex.toLowerCase()) ? true : false).length > 0) {return cur}
      return (acc.name.length > cur.name.length) && (acc.name.length < 25 && cur.name.length) < 25 ? acc : cur
    })
    var report = 
      ` ${'```less'}\nОтчёт о проделанной работе тренеров с [${new Date(date[0]._d).toLocaleDateString()}] по [${new Date(date[1]._d).toLocaleDateString()}]\n\nОсновной состав:\n`
      parsedData.map((tr) => {
          if (exceptions.filter((ex) => tr.name.toLowerCase().includes(ex.toLowerCase()) ? true : false).length > 0) {return}
            allTrained += Number(tr.trained === "-" ? 0 : tr.trained)
            allCheks += Number(tr.checks === "-" ? 0 : tr.checks)
            allExcursions += Number(tr.excursions === "-" ? 0 : tr.excursions)
            allChallenges += Number(tr.challenges === "-" ? 0 : tr.challenges)
            tr.name = tr.name.slice(0, tr.name.indexOf('|')).length === 5 ? tr.name.slice(0, tr.name.indexOf('|')) + " " + tr.name.slice(tr.name.indexOf('|')) : tr.name
            report += 
            tr.name + " ".repeat(probel.name.length + 1 - tr.name.length) + 
            "| " + tr.steamId + ` [обучил ${tr.trained == '-' ? '0 ' : tr.trained.length == 1 ? tr.trained + " " : tr.trained} | проверил ${tr.checks == '-' ? '0 ' : tr.checks.length == 1 ? tr.checks + " " : tr.checks} | экскурсий ${tr.excursions == '-' ? '0 ' : tr.excursions.length == 1 ? tr.excursions + " " : tr.excursions} | испытаний ${tr.challenges == '-' ? '0 ' : tr.challenges.length == 1 ? tr.challenges + " " : tr.challenges}]` + '\n'
      })
      report += '\n' + `Всего тренерским составом базы Анаксес обучено [${allTrained}], проверено [${allCheks}], экскурсий [${allExcursions}], испытаний [${allChallenges}].${'\n```'}`
      setResult(report)
      if (steamIdMatched.length !== steamIdMatchedUnique.length) {
        setError(`НАЙДЕНО СОВПАДЕНИЕ STEAMID ${steamIdMatched.filter((el, i, arr) => arr.indexOf(el) !== i)}`)
        
      }
      // axios.post('http://localhost:5000/send', {report:report})
  }, [exceptions, result, parsedData])

  async function getMessages() {
    if (date.length == 0) return setError('Заполните дату!')
    setError('')
    setLoading(true)
    await axios.get('https://api.swrpngg.online/get').then(res => {return getReport(res.data)}).finally(() => setLoading(false))
  }

  function addExcept(e) {
    e.preventDefault()
    setExceptions(prev => [...prev, except])
    setExcept('')
  }

  return (
    <Space style={{width:'100%'}} direction='vertical' size={12} className='DatePicker'>
      <RangePicker onChange={(date) => setDate(date)} />
      <Button onClick={() => getMessages()} type='primary' loading={loading ? true : false}>Получить отчёт</Button>
      {error ? <Alert type="error" message={error} showIcon /> : ''}
      {result.length
      ? <div className='area-all'>
          <p style={{textAlign:'center', fontSize:'20px'}}>Отчёт создаётся выравненным, вносить дополнительные правки не нужно</p>
          <div className='exceptions'>
            Добавить исключение
              <form onSubmit={(e) => addExcept(e)}>
                <Input placeholder='Номер или позывной' value={except} onChange={(e) => setExcept(e.target.value)} style={{MaxWidth:'230px', width:'100%'}} />
              </form>
          </div>
          {exceptions.length > 0 && 
          <div className='except-box'>
          Исключения:
            { 
              exceptions.map((ex) => <div onClick={() => setExceptions(exceptions.filter((exc) => exc == ex ? false : true))} className='except' key={ex}>{ex}</div>)
            }
          </div> 
          }
          <textarea className='area' value={result} onChange={(e) => setResult(e.target.value)} />
          <Button size='large' style={{background: copy ? 'green' : '', color: copy ? 'white' : ''}} type='default' onClick={() => (navigator.clipboard.writeText(result), setCopy(!copy), setTimeout(() => {setCopy(false)}, 1500))}>{copy ? 'Скопировано!' : 'Скопировать отчёт'}</Button>
        </div>
      : <div className='area' style={{background:'inherit'}}></div>
      }
    </Space>
  )
}

