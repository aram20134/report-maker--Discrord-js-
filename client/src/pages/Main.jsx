import React from 'react'
import '../styles/Main.scss'
import DayPicker from '../components/DayPicker';
import 'antd/dist/antd.css'

export default function Main() {
  return (
    <div className='Main'>
        <h1 className='Main__title'>Создать отчёт тренеров</h1>
        <DayPicker />
    </div>
  )
}