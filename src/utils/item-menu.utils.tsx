import {
  AccessTime, AcUnit,
  Commute,
  DateRange, Description, EmojiTransportation, Equalizer, EventNote, Group,
  LocationOn, Money, NoteAdd,
  PeopleAlt,
  PersonAdd, QueryBuilder, Settings,
  ShoppingCart,
  Toc
} from "@mui/icons-material";
import {BiBarcodeReader} from "react-icons/bi";
import React from "react";

export const items =[
  {
    title:'مدیریت کاربران',
    icon:<PeopleAlt />,
    color:'#304ffe',
    category:'accounts',
    children:[
      {
        title:'درج کاربر',
        icon:<PersonAdd/>,
        route:'/accounts/add'
      },
      {
        title:'لیست کاربران',
        icon:<Toc/>,
        route:'/accounts/list'
      },
      {
        title:'چارت سازمانی',
        icon:<Equalizer/>,
        route:'/accounts/chart'
      },
    ]
  },
  {
    title:'گزارشات',
    icon:<Description />,
    color: 'rgb(255, 152, 0)',
    category:'reports',
    employee:true,
    children:[
      {
        title:'تردد پرسنل',
        icon:<EmojiTransportation/>,
        route:'/reports/traffic',
        employee:true,
      },
      {
        title:'مالی',
        icon:<Money/>,
        route:'/reports/finance'
      },
      {
        title:'حضور و غیاب',
        icon:<Group/>,
        route:'/reports/attendance'
      },
      {
        title:'مرخصی',
        icon:<QueryBuilder/>,
        route:'/reports/leave'
      },
      {
        title:'ماموریت',
        icon:<EventNote/>,
        route:'/reports/mission'
      },
    ]
  },
  {
    title:'ماموریت',
    icon:<EventNote />,
    color: 'rgb(244, 67, 54)',
    category:'mission',
    employee:true,
    children:[
      {
        title:'درج ماموریت',
        icon:<NoteAdd/>,
        route:'/mission/add',
        employee:true,

      },
      {
        title:'لیست ماموریت ها',
        employee:true,
        icon:<Toc/>,
        route:'/mission/list'
      },
    ]
  },
  {
    title:'مدیریت',
    icon:<Settings />,
    color:'rgb(76, 175, 80)',
    category:'management',
    children:[
      {
        title:'تعطیلات',
        icon:<DateRange />,
        route:'/management/holiday'
      },
      {
        title:'ایستگاه ها',
        icon:<LocationOn />,
        route:'/management/stations'
      },
      {
        title:'وسایل نقلیه',
        icon:<Commute />,
        route:'/management/vehicles'
      },
      {
        title:'برنامه ها',
        icon:<Toc />,
        route:'/management/plans'
      },
    ]
  }
]

