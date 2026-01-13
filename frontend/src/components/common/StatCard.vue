<template>
  <div
    class="bg-white rounded-xl shadow-card p-6 cursor-pointer transition-all duration-200 hover:shadow-elevated hover:-translate-y-1"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-charcoal-600 mb-1">{{ title }}</p>
        
        <div v-if="loading" class="animate-pulse">
          <div class="h-8 bg-charcoal-200 rounded w-16 mb-2"></div>
          <div class="h-4 bg-charcoal-200 rounded w-20"></div>
        </div>
        
        <div v-else>
          <p class="text-3xl font-bold mb-2" :class="getTextColor(color)">
            {{ formattedValue }}
          </p>
          
          <div v-if="change !== undefined" class="flex items-center text-sm">
            <component
              :is="change >= 0 ? 'ArrowUpIcon' : 'ArrowDownIcon'"
              class="w-4 h-4 mr-1"
              :class="change >= 0 ? 'text-gray-600' : 'text-red-500'"
            />
            <span :class="change >= 0 ? 'text-gray-700' : 'text-red-600'">
              {{ Math.abs(change) }}%
            </span>
            <span class="text-charcoal-500 ml-1">vs last month</span>
          </div>
          
          <p v-else-if="subtitle" class="text-sm text-charcoal-500">
            {{ subtitle }}
          </p>
        </div>
      </div>
      
      <div class="ml-4 flex-shrink-0">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="getBgColor(color)">
          <component 
            :is="getIconComponent(icon)" 
            class="w-6 h-6" 
            :class="getIconColor(color)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Import Heroicons
import {
  GiftIcon,
  DocumentCheckIcon,
  Squares2X2Icon,
  ChartBarIcon,
  UsersIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'StatCard',
  components: {
    GiftIcon,
    DocumentCheckIcon,
    Squares2X2Icon,
    ChartBarIcon,
    UsersIcon,
    ArrowUpIcon,
    ArrowDownIcon
  },
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      required: true
    },
    icon: {
      type: String,
      default: 'chart-bar'
    },
    color: {
      type: String,
      default: 'emerald',
      validator: value => ['emerald', 'gold', 'charcoal', 'blue', 'red'].includes(value)
    },
    loading: {
      type: Boolean,
      default: false
    },
    change: {
      type: Number,
      default: undefined
    },
    subtitle: {
      type: String,
      default: ''
    },
    format: {
      type: String,
      default: 'number', // 'number', 'currency', 'percentage'
      validator: value => ['number', 'currency', 'percentage'].includes(value)
    }
  },
  emits: ['click'],
  computed: {
    formattedValue() {
      if (this.loading) return '...'
      
      const numValue = typeof this.value === 'string' ? parseInt(this.value) : this.value
      
      switch (this.format) {
        case 'currency':
          return new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: 'AED'
          }).format(numValue)
        case 'percentage':
          return `${numValue}%`
        default:
          return new Intl.NumberFormat().format(numValue)
      }
    }
  },
  methods: {
    getIconComponent(iconName) {
      const iconMap = {
        'gift': 'GiftIcon',
        'document-check': 'DocumentCheckIcon',
        'squares-plus': 'Squares2X2Icon',
        'chart-bar': 'ChartBarIcon',
        'users': 'UsersIcon'
      }
      
      return iconMap[iconName] || 'ChartBarIcon'
    },
    
    getBgColor(color) {
      const colorMap = {
        emerald: 'bg-gray-100',
        gold: 'bg-gold-100',
        charcoal: 'bg-charcoal-100',
        blue: 'bg-blue-100',
        red: 'bg-red-100'
      }
      
      return colorMap[color] || colorMap.emerald
    },
    
    getIconColor(color) {
      const colorMap = {
        emerald: 'text-gray-700',
        gold: 'text-gold-600',
        charcoal: 'text-charcoal-600',
        blue: 'text-blue-600',
        red: 'text-red-600'
      }
      
      return colorMap[color] || colorMap.emerald
    },
    
    getTextColor(color) {
      const colorMap = {
        emerald: 'text-gray-800',
        gold: 'text-gold-700',
        charcoal: 'text-charcoal-700',
        blue: 'text-blue-700',
        red: 'text-red-700'
      }
      
      return colorMap[color] || colorMap.emerald
    }
  }
}
</script>

<style scoped>
/* Smooth hover animations */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Loading animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Focus styles for accessibility */
.cursor-pointer:focus {
  outline: 2px solid #006C57;
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .transition-all {
    transition: none !important;
  }
  
  .hover\:-translate-y-1:hover {
    transform: none !important;
  }
  
  .animate-pulse {
    animation: none !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .shadow-card {
    border: 1px solid #374151;
  }
  
  .shadow-elevated {
    border: 2px solid #374151;
  }
}
</style>
