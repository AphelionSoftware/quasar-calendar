import dashHas from 'lodash.has'
import { DateTime } from 'luxon'
export default {
  computed: {},
  methods: {
    handleStartChange: function (val, oldVal) {
      this.doUpdate()
    },
    makeDT: function (dateObject, adjustTimezone) {
      if (typeof dateObject === 'undefined') {
        return null
      }
      if (dateObject instanceof Date) {
        dateObject = DateTime.fromJSDate(dateObject)
      }
      if (
        this.calendarLocale &&
        (!dashHas(dateObject, 'locale') || this.calendarLocale !== dateObject.locale)
      ) {
        dateObject = dateObject.setLocale(this.calendarLocale)
      }
      if (adjustTimezone && adjustTimezone !== dateObject.zoneName) {
        dateObject = dateObject.setZone(this.calendarTimezone)
      }
      return dateObject
    },
    triggerEventClick: function (eventObject, eventRef) {
      this.$root.$emit(
        'click-event-' + eventRef,
        eventObject
      )
    },
    handleEventDetailEvent: function (params, thisRef) {
      if (!this.preventEventDetail) {
        if (thisRef === undefined) {
          thisRef = 'defaultEventDetail'
        }
        this.eventDetailEventObject = params
        if (dashHas(this.$refs, thisRef + '.__open')) {
          this.$refs[thisRef].__open()
        }
        else if (dashHas(this, thisRef + '.__open')) {
          this[thisRef].__open()
        }
      }
    },
    fullMoveToDay: function (dateObject) {
      if (this.fullComponentRef) {
        this.$root.$emit(
          this.fullComponentRef + ':moveToSingleDay', {
            dateObject: dateObject
          }
        )
      }
    },
    getEventColor: function (eventObject, colorName) {
      if (dashHas(eventObject, colorName)) {
        return eventObject[colorName]
      }
      else if (dashHas(this, colorName)) {
        return this[colorName]
      }
      else if (colorName === 'textColor') {
        return 'white'
      }
      else {
        return 'primary'
      }
    },
    getStatusColor (eventObject) {
      switch (eventObject.status) {
        default:
        case 'INCOMPLETE':
          return 'red-8'
        case 'IN PROGRESS':
          return 'orange-8'
        case 'COMPLETE':
          return 'green-8'
      }
    },
    addCssColorClasses: function (cssObject, eventObject) {
      cssObject['bg-' + this.getStatusColor(eventObject)] = true
      cssObject['text-' + this.getEventColor(eventObject, 'textColor')] = true
      return cssObject
    },
    formatDate: function (dateObject, formatString, usePredefined) {
      if (usePredefined) {
        return this.makeDT(dateObject).toLocaleString(DateTime[formatString])
      }
      else {
        return this.makeDT(dateObject).toFormat(formatString)
      }
    },
    dateAdjustWeekday (thisDateObject, weekdayNum) {
      thisDateObject = this.makeDT(thisDateObject)
      let checkDate = DateTime.local()
      let adjustForward = true
      if (weekdayNum < 1) {
        adjustForward = false
        weekdayNum = Math.abs(weekdayNum)
        if (weekdayNum === 0) {
          weekdayNum = 7
        }
      }
      for (let counter = 1; counter <= 7; counter++) {
        if (adjustForward) {
          checkDate = thisDateObject.plus({ days: counter })
        }
        else {
          checkDate = thisDateObject.minus({ days: counter })
        }
        if (checkDate.weekday === weekdayNum) {
          return checkDate
        }
      }
    },
    buildWeekDateArray: function (numberOfDays, sundayFirstDayOfWeek) {
      if (numberOfDays === undefined) {
        if (this.numberOfDays !== undefined) {
          numberOfDays = this.numberOfDays
        }
        else if (this.numDays !== undefined) {
          numberOfDays = this.numDays
        }
        else {
          numberOfDays = 7
        }
      }
      if (this.forceStartOfWeek) {
        this.weekDateArray = this.getForcedWeekDateArray(numberOfDays, sundayFirstDayOfWeek)
      }
      else {
        this.weekDateArray = this.getWeekDateArray(numberOfDays)
      }
    },
    getForcedWeekBookendDates: function (numberOfDays, sundayFirstDayOfWeek) {
      if (numberOfDays === undefined) {
        numberOfDays = 7
      }
      if (sundayFirstDayOfWeek) {
        return {
          first: this.dateAdjustWeekday(this.workingDate, -1).minus({days: 1}),
          last: this.dateAdjustWeekday(this.workingDate, numberOfDays).minus({days: 1})
        }
      }
      else {
        return {
          first: this.dateAdjustWeekday(this.workingDate, -1),
          last: this.dateAdjustWeekday(this.workingDate, numberOfDays)
        }
      }
    },
    getForcedWeekDateArray: function (numberOfDays, sundayFirstDayOfWeek) {
      let bookendDates = this.getForcedWeekBookendDates(numberOfDays, sundayFirstDayOfWeek)
      let returnArray = []
      for (let counter = 0; counter <= numberOfDays - 1; counter++) {
        returnArray.push(
          this.makeDT(bookendDates.first).plus({days: counter})
        )
      }
      return returnArray
    },
    getWeekDateArray: function (numberOfDays) {
      let returnArray = []
      for (let counter = 0; counter <= numberOfDays - 1; counter++) {
        returnArray.push(
          this.makeDT(this.workingDate).plus({ days: counter })
        )
      }
      return returnArray
    },
    formatTimeFromNumber: function (hourNumber) {
      // TODO: this should be able to handle 24 hour and alternate time formats
      let tempDate = this.makeDT(DateTime.fromObject({ hour: hourNumber }))
      let localeFormattedHour = tempDate.toLocaleString(DateTime.TIME_SIMPLE)
      return localeFormattedHour
        .replace(/:[0-9][0-9]/, '')
        .replace(' ', '')
        .toLowerCase()
    },
    simplifyTimeFormat: function (timeString, removeMeridiem) {
      if (removeMeridiem) {
        timeString = timeString.replace(/[AP]M/i, '')
      }
      return timeString
        .replace(':00', '')
        .replace(' ', '')
        .toLowerCase()
    },
    moveTimePeriod: function (params) {
      let paramObj = {}
      paramObj[params.unitType] = params.amount
      this.workingDate = this.workingDate.plus(paramObj)
      this.$root.$emit('calendar-switch-period', this.workingDate)
    },
    setTimePeriod: function (params) {
      this.workingDate = params.dateObject
    },
    getDayOfWeek: function () {
      return this.createThisDate(this.dayNumber).format('dddd')
    },
    createThisDate: function (dateNum) {
      return this.parseDateParams(dateNum)
    },
    isCurrentDate: function (thisDateObject) {
      return DateTime.local().hasSame(
        this.makeDT(thisDateObject),
        'day'
      )
    },
    isWeekendDay: function (thisDateObject) {
      const dayNumber = this.makeDT(thisDateObject).weekday
      return (dayNumber === 6 || dayNumber === 7)
    },
    getWeekNumber (thisDateObject, useSundayStart) {
      if (useSundayStart) {
        return this.makeDT(thisDateObject).plus({days: 1}).weekNumber
      }
      else {
        return this.makeDT(thisDateObject).weekNumber
      }
    },
    mountSetDate: function () {
      this.workingDate = this.makeDT(this.startDate)
    },
    decimalAdjust: function (type, value, exp) {
      // from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor
      // If the exp is undefined or zero...
      if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value)
      }
      value = +value
      exp = +exp
      // If the value is not a number or the exp is not an integer...
      if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN
      }
      // Shift
      value = value.toString().split('e')
      value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)))
      // Shift back
      value = value.toString().split('e')
      return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp))
    },
    calculateDayCellWidth: function (numberOfDays) {
      return this.decimalAdjust(
        'floor',
        100 / numberOfDays,
        -3
      ) + '%'
    },
    createNewNavEventName: function () {
      return 'calendar:navMovePeriod:' + this.createRandomString()
    },
    createRandomString: function () {
      return Math.random().toString(36).substring(2, 15)
    },
    getEventIdString: function (eventObj) {
      if (dashHas(eventObj, 'id')) {
        if (typeof eventObj.id === 'number') {
          return eventObj.id.toString()
        }
        else if (typeof eventObj.id === 'string') {
          return eventObj.id
        }
        else {
          return '' + eventObj.id
        }
      }
      else {
        return 'NOID' + this.createRandomString()
      }
    },
    getDayHourId: function (eventRef, workingDate, thisHour) {
      return eventRef +
        '-' +
        this.makeDT(workingDate).toISODate() +
        '-hour-' +
        thisHour
    }
  },
  mounted () {}
}
