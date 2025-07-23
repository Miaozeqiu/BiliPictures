<template>
  <div class="radio-inputs">
    <div class="slider" :style="{ top: sliderPosition }"></div>
    <label class="radio" v-for="(option, index) in options" :key="index">
      <input type="radio" :name="name" :value="option" v-model="selectedOption" @change="updateValue"/>
      <span class="name">
        <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <g v-html="getIcon(option)"></g>
        </svg>
        {{ option }}
      </span>
    </label>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
      default: '豆瓣评分',
    },
  },
  data() {
    return {
      selectedOption: this.modelValue || '默认',
      options: ['默认', '豆瓣评分', '上映时间'],
      name: 'sort-radio',
      iconMap: {
        '默认': '<path d="M298.666667 213.333333h426.666666v85.333334H298.666667V213.333333z m0 256h426.666666v85.333334H298.666667V469.333333z m0 256h426.666666v85.333334H298.666667V725.333333z m-85.333334-512h85.333334v85.333334H213.333333V213.333333z m0 256h85.333334v85.333334H213.333333V469.333333z m0 256h85.333334v85.333334H213.333333V725.333333z" fill="currentColor"></path>',
        '豆瓣评分': '<path d="M512 85.333333c235.637333 0 426.666667 191.029333 426.666667 426.666667s-191.029333 426.666667-426.666667 426.666667S85.333333 747.637333 85.333333 512 276.362667 85.333333 512 85.333333z m0 64C311.701333 149.333333 149.333333 311.701333 149.333333 512s162.368 362.666667 362.666667 362.666667 362.666667-162.368 362.666667-362.666667S712.298667 149.333333 512 149.333333z m0 106.666667c141.385333 0 256 114.614667 256 256s-114.614667 256-256 256-256-114.614667-256-256 114.614667-256 256-256z m0 64c-106.039333 0-192 85.960667-192 192s85.960667 192 192 192 192-85.960667 192-192-85.960667-192-192-192z m0 85.333333c58.88 0 106.666667 47.786667 106.666667 106.666667s-47.786667 106.666667-106.666667 106.666667-106.666667-47.786667-106.666667-106.666667 47.786667-106.666667 106.666667-106.666667z" fill="currentColor"></path>',
        '上映时间': '<path d="M512 85.333333c235.637333 0 426.666667 191.029333 426.666667 426.666667s-191.029333 426.666667-426.666667 426.666667S85.333333 747.637333 85.333333 512 276.362667 85.333333 512 85.333333z m0 64C311.701333 149.333333 149.333333 311.701333 149.333333 512s162.368 362.666667 362.666667 362.666667 362.666667-162.368 362.666667-362.666667S712.298667 149.333333 512 149.333333z m32 106.666667v234.666667l170.666667 170.666666-45.254667 45.254667L512 618.666667V256h32z" fill="currentColor"></path>'
      }
    };
  },
  computed: {
    sliderPosition() {
      const index = this.options.indexOf(this.selectedOption);
      const optionHeight = 100 / this.options.length;
      return `${index * optionHeight + 0.25}%`;
    },
  },
  methods: {
    updateValue() {
      this.$emit('update:modelValue', this.selectedOption);
    },
    getIcon(option) {
      return this.iconMap[option] || '';
    },
  },
};
</script>

<style scoped>
svg {
  height: 30px;
}

.icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  flex-shrink: 0;
  fill: currentColor;
}

.radio-inputs {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 0.5rem;
  background-color: #ffffff;
  width: 200px;
  font-size: 14px;
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.radio-inputs .radio {
  flex: 1 1 auto;
  text-align: center;
  position: relative;
  height: 33.33%;
  display: flex;
  align-items: center;
}

.radio-inputs .radio:nth-child(2) .name {
  animation: textFadeIn 0.5s ease-out 0.4s both;
}

.radio-inputs .radio:nth-child(3) .name {
  animation: textFadeIn 0.5s ease-out 0.5s both;
}

.radio-inputs .radio:nth-child(4) .name {
  animation: textFadeIn 0.5s ease-out 0.6s both;
}

.radio-inputs .radio input {
  display: none;
}

.radio-inputs .radio .name {
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: flex-start;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: rgba(51, 65, 85, 1);
  transition: color 0.15s ease-in-out, transform 0.2s ease;
  position: relative;
  z-index: 3;
  width: 100%;
  white-space: nowrap;
  height: 100%;
  box-sizing: border-box;
  opacity: 0;
  transform: translateX(-10px);
}

.radio-inputs .radio .name:hover {
  transform: translateX(0) scale(1.02);
}

.radio-inputs .radio input:checked + .name {
  font-weight: 600;
  color: #ff69b4;
}

.radio-inputs .radio input:checked + .name .icon {
  fill: #ff69b4;
}

.slider {
  position: absolute;
  background-color: #eeeef5;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  height: calc(33.33% - 0.125rem);
  width: calc(100% - 0.5rem);
  left: 0.25rem;
  z-index: 1;
  opacity: 0;
  animation: slideIn 0.8s ease-out 0.3s forwards;
}

/* 首次加载动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes textFadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

span {
  -webkit-tap-highlight-color: transparent;
}
</style>
