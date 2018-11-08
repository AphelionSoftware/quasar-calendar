<template>
  <div>
    <div class="relative-position calendar-header col-auto row justify-between items-center text-white" :class="'bg-' + ($route.meta.colour || 'primary')">
      <div class="calendar-header-label">
        <slot/>
        <slot name="buttons" />
      </div>
    </div>
    <div class="calendar-header col-auto row justify-between items-center">
      <div class="calendar-header-left col-auto">
        <q-btn
          @click="doMoveTimePeriod(timePeriodUnit, -timePeriodAmount)"
          icon="chevron_left"
          color="primary"
          rounded
          label="Previous Month"
          flat
        />
      </div>
      <div class="calendar-header-right col-auto">
        <q-btn
          @click="doMoveTimePeriod(timePeriodUnit, timePeriodAmount)"
          icon-right="chevron_right"
          color="primary"
          rounded
          label="Next Month"
          flat
        />
      </div>
    </div>
  </div>
</template>

<script>
  import {
    QBtn
  } from 'quasar'
  export default {
    name: 'CalendarHeaderNav',
    props: {
      timePeriodUnit: {
        type: String,
        default: 'days'
      },
      timePeriodAmount: {
        type: Number,
        default: 1
      },
      moveTimePeriodFunction: Object,
      moveTimePeriodEmit: {
        type: String,
        default: 'calendar:navMovePeriod'
      }
    },
    components: {
      QBtn
    },
    data () {
      return {}
    },
    computed: {},
    methods: {
      doMoveTimePeriod (timePeriodUnit, timePeriodAmount) {
        this.$root.$emit(
          this.moveTimePeriodEmit,
          {
            unitType: timePeriodUnit,
            amount: timePeriodAmount
          }
        )
      }
    },
    mounted () {}
  }
</script>

<style lang="stylus">
  .calendar-header
    .calendar-month-year
      font-size 1.25em
      font-weight bold
</style>
