<template>
  <div>
    <q-toolbar class="slim relative-position overflow-visible shadow-soft-1" :color="$route.meta.colour || 'primary'">
      <q-toolbar-title>
        <slot/>
      </q-toolbar-title>
      <slot name="buttons" />
    </q-toolbar>
    <div class="calendar-header flex justify-start q-pt-sm q-pl-md q-pr-md">
      <div class="calendar-header-left col-auto q-pr-lg">
        <q-btn
          @click="doMoveTimePeriod(timePeriodUnit, -timePeriodAmount)"
          icon="chevron_left"
          color="primary"
          rounded
          dense
          label="Previous Month"
          flat
          class="gt-xs"
        />
        <q-btn
          @click="doMoveTimePeriod(timePeriodUnit, -timePeriodAmount)"
          icon="chevron_left"
          color="primary"
          round
          dense
          flat
          class="lt-sm"
        />
      </div>
      <div class="calendar-header-right col-auto">
        <q-btn
          @click="doMoveTimePeriod(timePeriodUnit, timePeriodAmount)"
          icon-right="chevron_right"
          color="primary"
          rounded
          dense
          label="Next Month"
          flat
          class="gt-xs"
        />
        <q-btn
          @click="doMoveTimePeriod(timePeriodUnit, timePeriodAmount)"
          icon="chevron_right"
          color="primary"
          round
          dense
          flat
          class="lt-sm"
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
    mounted: function () {}
  }
</script>

<style lang="stylus">
  .calendar-header
    .calendar-month-year
      font-size 1.25em
      font-weight bold
</style>
