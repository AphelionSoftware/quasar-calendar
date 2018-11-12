<template>
  <div class="calendar-month">

    <!-- calendar header -->
    <calendar-header-nav
      time-period-unit="month"
      :time-period-amount="1"
      :move-time-period-emit="eventRef + ':navMovePeriod'"
    >
      <template>{{ formatDate(workingDate, 'MMMM yyyy') }}</template>
      <template slot="buttons">
        <slot />
      </template>
    </calendar-header-nav>

    <div class="calendar-content">
      <calendar-day-labels
        :number-of-days="7"
        :start-date="workingDate"
        :force-start-of-week="true"
        :sunday-first-day-of-week="sundayFirstDayOfWeek"
        :calendar-locale="calendarLocale"
      />
      <div
        v-for="(thisWeek, index) in weekArray"
        :key="index"
        :class="{
          'calendar-multi-day': true,
          'row': true,
          'no-wrap': true,
          'items-start': true,
          'justify-end': index < (weekArray.length - 1),
          'justify-start': index === (weekArray.length - 1)
        }"
      >
        <div
          :class="{
            'calendar-day': true,
            'calendar-cell': true,
            'calendar-day-weekend': isWeekendDay(thisDay.dateObject),
            'calendar-day-current': isCurrentDate(thisDay.dateObject),
            'calendar-cell-hidden': !hasAnyEvents(thisDay.dateObject)
          }"
          v-for="(thisDay, weekDayIndex) in thisWeek"
          :key="makeDT(thisDay.dateObject).toISODate()"
        >
          <div
            v-if="isCurrentDate(thisDay.dateObject)"
            :class="{
              'calendar-day-number': true,
              'cursor-pointer': calendarDaysAreClickable
            }"
            @click="handleDayClick(thisDay.dateObject)"
          >
            <quantity-bubble
              :date="thisDay.dateObject"
              :offset="false"
              current-date
            />
          </div>
          <div
            v-else
            :class="{
              'calendar-day-number': true,
              'cursor-pointer': calendarDaysAreClickable
            }"
            @click="handleDayClick(thisDay.dateObject)"
          >
            <quantity-bubble
              :date="thisDay.dateObject"
              :offset="false"
              text-color="black"
              background-color="transparent"
            />
          </div>
          <div class="calendar-day-content">
            <template v-if="hasAnyEvents(thisDay.dateObject)">
              <div
                v-for="thisEvent in monthGetDateEvents(thisDay.dateObject)"
                :key="thisEvent.id"
              >
                <calendar-event
                  :event-object="thisEvent"
                  :month-style="true"
                  :event-ref="eventRef"
                  :prevent-event-detail="preventEventDetail"
                  :current-calendar-day="thisDay.dateObject"
                  :has-previous-day="thisEvent.hasPrev"
                  :has-next-day="thisEvent.hasNext"
                  :first-day-of-week="(weekDayIndex === 0)"
                  :last-day-of-week="(weekDayIndex === (thisWeek.length -1))"
                  :allow-editing="allowEditing"
                >
                  <template slot="popover" slot-scope="{event}">
                    <slot name="popover" :event="event" />
                  </template>
                </calendar-event>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <calendar-event-detail
      ref="defaultEventDetail"
      v-if="!preventEventDetail"
      :event-object="eventDetailEventObject"
      :calendar-locale="calendarLocale"
      :calendar-timezone="calendarTimezone"
      :event-ref="eventRef"
      :allow-editing="allowEditing"
    />

  </div>
</template>

<script>
  import CalendarMixin from './mixins/CalendarMixin'
  import CalendarEventMixin from './mixins/CalendarEventMixin'
  import CalendarParentComponentMixin from './mixins/CalendarParentComponentMixin'
  import {
    QBtn,
    QTooltip,
    QTabs,
    QTab,
    QTabPane,
    QScrollArea
  } from 'quasar'
  import QuantityBubble from './QuantityBubble'
  import CalendarEvent from './CalendarEvent'
  import CalendarDayLabels from './CalendarDayLabels'
  import CalendarHeaderNav from './CalendarHeaderNav'
  import CalendarEventDetail from './CalendarEventDetail'
  const { DateTime } = require('luxon')
  export default {
    name: 'CalendarMonth',
    components: {
      QuantityBubble,
      CalendarEvent,
      CalendarDayLabels,
      CalendarHeaderNav,
      CalendarEventDetail,
      QBtn,
      QTooltip,
      QTabs,
      QTab,
      QTabPane,
      QScrollArea
    },
    mixins: [CalendarParentComponentMixin, CalendarMixin, CalendarEventMixin],
    props: {
      fullComponentRef: String
    },
    data () {
      return {
        dayCellHeight: 5,
        dayCellHeightUnit: 'rem',
        workingDate: new Date(),
        weekArray: [],
        parsed: this.getDefaultParsed(),
        eventDetailEventObject: {}
      }
    },
    computed: {
      calendarDaysAreClickable: function () {
        return (this.fullComponentRef && this.fullComponentRef.length > 0)
      }
    },
    methods: {
      monthGetDateEvents: function (dateObject) {
        return this.dateGetEvents(dateObject)
      },
      doUpdate: function () {
        this.mountSetDate()
        this.generateCalendarCellArray()
      },
      getCalendarCellArray: function (monthNumber, yearNumber) {
        let currentDay = this.makeDT(
          DateTime.fromObject({
            year: yearNumber,
            month: monthNumber,
            day: 1
          })
        )
        let currentWeekOfYear = this.getWeekNumber(currentDay, this.sundayFirstDayOfWeek)
        let weekArray = []
        let currentWeekArray = []
        let thisDayObject = {}
        for (let thisDateOfMonth = 1; thisDateOfMonth <= 31; thisDateOfMonth++) {
          currentDay = this.makeDT(
            DateTime.fromObject({
              year: yearNumber,
              month: monthNumber,
              day: thisDateOfMonth
            })
          )
          if (
            currentDay.year === yearNumber &&
            currentDay.month === monthNumber
          ) {
            if (
              this.getWeekNumber(currentDay, this.sundayFirstDayOfWeek) !== currentWeekOfYear
            ) {
              weekArray.push(currentWeekArray)
              currentWeekOfYear = this.getWeekNumber(currentDay, this.sundayFirstDayOfWeek)
              currentWeekArray = []
            }
            thisDayObject = {
              dateObject: currentDay,
              year: currentDay.year,
              month: currentDay.month,
              date: currentDay.day,
              dayName: currentDay.toFormat('EEEE'),
              dayNumber: currentDay.weekday
            }
            currentWeekArray.push(thisDayObject)
          }
        }
        if (weekArray.length > 0) {
          weekArray.push(currentWeekArray)
        }
        return weekArray
      },
      generateCalendarCellArray: function () {
        this.weekArray = this.getCalendarCellArray(
          this.makeDT(this.workingDate).month,
          this.makeDT(this.workingDate).year
        )
      },
      handleNavMove: function (params) {
        this.moveTimePeriod(params)
        this.$emit(
          this.eventRef + ':navMovePeriod',
          {
            unitType: params.unitType,
            amount: params.amount
          }
        )
        this.generateCalendarCellArray()
      },
      handleDayClick: function (dateObject) {
        if (this.fullComponentRef) {
          this.fullMoveToDay(dateObject)
        }
        this.$root.$emit('click-date-' + this.eventRef, dateObject)
      }
    },
    mounted () {
      this.doUpdate()
      this.handlePassedInEvents()
      this.$root.$on(
        this.eventRef + ':navMovePeriod',
        this.handleNavMove
      )
      this.$root.$on(
        'click-event-' + this.eventRef,
        this.handleEventDetailEvent
      )
      this.$root.$on(
        'update-event-' + this.eventRef,
        this.handleEventUpdate
      )
    },
    watch: {
      startDate: 'handleStartChange',
      eventArray: function () {
        this.getPassedInEventArray()
      },
      parsedEvents: function () {
        this.getPassedInParsedEvents()
      }
    }
  }
</script>

<style lang="stylus">
  @import 'calendar.vars.styl'

  .calendar-month

    .calendar-time-width
      width $dayTimeLabelWidth
    .calendar-time-margin
      margin-left $dayTimeLabelWidth

    .calendar-header
      .calendar-header-label
        font-size 1.25em
        font-weight bold
    .calendar-content
      padding 4px 12px
      .calendar-cell
        width $cellWidth
        max-width $cellWidth
        padding 0
      .calendar-day-labels
        @media screen and (max-width: 767px)
          &
            display none
        .calendar-day-label
          font-size 1.1em
        .calendar-day-label-current
          font-weight bold
      .calendar-multi-day
        border-bottom 1px solid $borderColor
        @media screen and (max-width: 767px)
          &
            flex-direction column
          border-bottom none
        :last-child
          border-bottom none
      .calendar-day
        background-color none
        height $cellHeight
        max-height $cellHeight
        overflow auto
        width $sevenCellWidth
        &.calendar-day-current.calendar-cell-hidden
          &:after
            content 'No events today'
            text-align center
            opacity .4
            display block
            padding 5px 10px
        @media screen and (max-width: 767px)
          &
            width 100%
            height auto
            margin-bottom 20px
            max-height 100%
          &.calendar-cell-hidden:not(.calendar-day-current)
            opacity .2
        .calendar-day-number
          font-size 0.9em
          height 2em
          width 2em
          vertical-align middle
          padding-top .25em
          padding-left .25em
          @media screen and (max-width: 767px)
            &
              height 3.5em
              width 60px
      .calendar-day-current
        background-color $currentDayBackgroundColor
      .calendar-day-weekend
        background-color $weekendDayBackgroundColor

</style>
