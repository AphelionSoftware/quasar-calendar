<template>
  <div
    class="quantity-bubble-holder"
    v-if="quantity > 0"
  >
    &nbsp;
    <div :class="bubbleClass">
      <div class="quantity-value">
        <span class="gt-sm">
          {{ quantity }}
        </span>
        <div class="lt-md">
          <div class="small-text">
            <small>
              {{ date.toFormat('ccc') }}
            </small>
          </div>
          <div class="text-bold">{{ date.toFormat('LLL d') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { DateTime } from 'luxon'
  export default {
    props: {
      date: {
        type: DateTime,
        default: 0
      },
      backgroundColor: {
        type: String,
        default: 'primary'
      },
      textColor: {
        type: String,
        default: 'white'
      },
      offset: {
        type: Boolean,
        default: true
      },
      currentDate: {
        type: Boolean,
        default: false
      }
    },
    filters: {},
    computed: {
      quantity () {
        return this.date.day
      },
      bubbleClass: function () {
        let returnVal = {
          'quantity-bubble': true,
          'row': true,
          'col': true,
          'items-center': true,
          'justify-center': true,
          'shadow-1': false,
          'current-date': this.currentDate
        }
        returnVal['bg-' + this.backgroundColor] = true
        returnVal['text-' + this.textColor] = true
        if (this.offset) {
          returnVal['quantity-bubble-offset'] = true
        }
        return returnVal
      },
      readableString () {
        return this.date.toFormat('LLL. d').toString()
      }
    },
    methods: {},
    components: {},
    data () {
      return {}
    }
  }
</script>

<style lang="stylus">
  .quantity-bubble-holder
    position relative
    display inline-block
    .quantity-bubble
      position absolute
      top 2px
      left 2px
      width 60px
      text-align left
      cursor pointer
      @media screen and (min-width: 768px)
        &
          border-radius 50%
          font-size 0.75em
          text-align center
          height 2em
          width 2em
        &.current-date
          font-weight bold
      .quantity-value
        vertical-align middle
    .quantity-bubble-offset
      bottom 0.25em
      left -0.25em
</style>
