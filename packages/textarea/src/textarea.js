import XEUtils from 'xe-utils'
import GlobalConfig from '../../conf'
import { UtilTools } from '../../tools'

export default {
  name: 'VxeTextarea',
  props: {
    value: [String, Number],
    name: String,
    readonly: Boolean,
    disabled: Boolean,
    placeholder: String,
    maxlength: [String, Number],
    rows: { type: [String, Number], default: 2 },
    showWordCount: Boolean,
    autosize: [Boolean, Object],
    form: String,
    resize: { type: String, default: () => GlobalConfig.textarea.resize },
    size: String
  },
  computed: {
    vSize () {
      return this.size || this.$parent.size || this.$parent.vSize
    },
    inputCount () {
      return XEUtils.getSize(this.value)
    },
    isCountError () {
      return this.maxlength && this.inputCount > XEUtils.toNumber(this.maxlength)
    },
    sizeValue () {
      return ('' + (this.value || '　')).replace(/\n$/, '\n　')
    },
    defaultEvents () {
      const evnts = {}
      XEUtils.each(this.$listeners, (cb, name) => {
        if (['change'].indexOf(name) === -1) {
          evnts[name] = this.triggerEvent
        }
      })
      evnts.input = this.inputEvent
      return evnts
    },
    sizeOpts () {
      return Object.assign({ minRows: 1, maxRows: 10 }, GlobalConfig.textarea.autosize, this.autosize)
    }
  },
  created () {
    this.handleResize()
  },
  render (h) {
    const { defaultEvents, value, vSize, name, form, resize, placeholder, readonly, disabled, maxlength, autosize, showWordCount } = this
    const attrs = {
      name,
      form,
      placeholder,
      maxlength,
      readonly,
      disabled
    }
    if (placeholder) {
      attrs.placeholder = UtilTools.getFuncText(placeholder)
    }
    return h('div', {
      class: ['vxe-textarea', {
        [`size--${vSize}`]: vSize,
        'is--autosize': autosize,
        'is--disabled': disabled
      }]
    }, [
      h('textarea', {
        ref: 'textarea',
        class: 'vxe-textarea--inner',
        domProps: {
          value
        },
        attrs,
        style: resize ? {
          resize
        } : null,
        on: defaultEvents
      }),
      autosize ? h('span', {
        ref: 'size',
        class: 'vxe-textarea--autosize'
      }, this.sizeValue) : null,
      showWordCount ? h('span', {
        class: ['vxe-textarea--count', {
          'is--error': this.isCountError
        }]
      }, `${this.inputCount}${maxlength ? `/${maxlength}` : ''}`) : null
    ])
  },
  methods: {
    focus () {
      this.$refs.textarea.focus()
      return this.$nextTick()
    },
    blur () {
      this.$refs.textarea.blur()
      return this.$nextTick()
    },
    emitUpdate (value) {
      this.$emit('input', value)
      if (this.value !== value) {
        this.$emit('change', { value })
      }
    },
    inputEvent (evnt) {
      this.emitUpdate(evnt.target.value)
      this.handleResize()
    },
    handleResize () {
      if (this.autosize) {
        this.$nextTick(() => {
          const { $refs, sizeOpts } = this
          const { minRows, maxRows } = sizeOpts
          const textElem = $refs.textarea
          const sizeElem = $refs.size
          const sizeHeight = sizeElem.clientHeight
          const textStyle = getComputedStyle(textElem)
          const lineHeight = XEUtils.toNumber(textStyle.lineHeight)
          const paddingTop = XEUtils.toNumber(textStyle.paddingTop)
          const paddingBottom = XEUtils.toNumber(textStyle.paddingBottom)
          const borderTopWidth = XEUtils.toNumber(textStyle.borderTopWidth)
          const borderBottomWidth = XEUtils.toNumber(textStyle.borderBottomWidth)
          const intervalHeight = paddingTop + paddingBottom + borderTopWidth + borderBottomWidth
          const textRows = Math.floor((sizeHeight - intervalHeight) / lineHeight) + 1
          let vaildRows = textRows
          if (textRows < minRows) {
            vaildRows = minRows
          } else if (textRows > maxRows) {
            vaildRows = maxRows
          }
          textElem.style.height = `${(vaildRows * lineHeight) + intervalHeight}px`
        })
      }
    }
  }
}