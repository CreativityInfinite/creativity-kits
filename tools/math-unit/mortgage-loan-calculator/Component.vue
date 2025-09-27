<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">房贷计算器</h1>
      <p class="text-gray-600 dark:text-gray-400">根据等额本息计算月供、总利息等指标。</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">贷款总额（元）</label>
        <input v-model.number="principal" type="number" min="0" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">年利率（%）</label>
        <input v-model.number="annualRate" type="number" step="0.01" min="0" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">年限（年）</label>
        <input v-model.number="years" type="number" min="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
    </div>

    <div class="flex justify-center">
      <button @click="calculate" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">计算</button>
    </div>

    <div v-if="result" class="space-y-4">
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">月供：{{ formatCNY(result.monthlyPayment) }}</div>
          <div class="text-lg text-gray-600 dark:text-gray-300">共 {{ result.totalMonths }} 期</div>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ formatCNY(result.totalPayment) }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">总还款</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ formatCNY(result.totalInterest) }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">总利息</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ (annualRate || 0).toFixed(2) }}%</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">年利率</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ years }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">年限</div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border overflow-auto">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">首月/末月详情</div>
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-gray-600 dark:text-gray-400">
              <th class="py-2 pr-4">期数</th>
              <th class="py-2 pr-4">当期本金</th>
              <th class="py-2 pr-4">当期利息</th>
              <th class="py-2 pr-4">剩余本金</th>
            </tr>
          </thead>
          <tbody class="text-gray-800 dark:text-gray-200">
            <tr>
              <td class="py-2 pr-4">1</td>
              <td class="py-2 pr-4">{{ formatCNY(result.schedule.first.principal) }}</td>
              <td class="py-2 pr-4">{{ formatCNY(result.schedule.first.interest) }}</td>
              <td class="py-2 pr-4">{{ formatCNY(result.schedule.first.balance) }}</td>
            </tr>
            <tr>
              <td class="py-2 pr-4">{{ result.totalMonths }}</td>
              <td class="py-2 pr-4">{{ formatCNY(result.schedule.last.principal) }}</td>
              <td class="py-2 pr-4">{{ formatCNY(result.schedule.last.interest) }}</td>
              <td class="py-2 pr-4">{{ formatCNY(result.schedule.last.balance) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const principal = ref(1000000)
const annualRate = ref(3.8)
const years = ref(30)
const result = ref<null | {
  monthlyPayment: number
  totalMonths: number
  totalPayment: number
  totalInterest: number
  schedule: {
    first: { principal: number; interest: number; balance: number }
    last: { principal: number; interest: number; balance: number }
  }
}>(null)

function calculate() {
  const P = Math.max(0, Number(principal.value || 0))
  const r = Math.max(0, Number(annualRate.value || 0)) / 100 / 12
  const n = Math.max(1, Math.floor((years.value || 1) * 12))
  if (P === 0) {
    result.value = null
    return
  }

  const M = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  let balance = P
  const firstInterest = balance * r
  const firstPrincipal = M - firstInterest
  const lastInterest = (balance - (M * (n - 1) - (firstInterest * (1 - Math.pow(1 + r, -(n - 1)))) / r)) * r // 近似
  const lastPrincipal = M - lastInterest

  const totalPayment = M * n
  const totalInterest = totalPayment - P

  result.value = {
    monthlyPayment: round2(M),
    totalMonths: n,
    totalPayment: round2(totalPayment),
    totalInterest: round2(totalInterest),
    schedule: {
      first: { principal: round2(firstPrincipal), interest: round2(firstInterest), balance: round2(P - firstPrincipal) },
      last: { principal: round2(lastPrincipal), interest: round2(lastInterest), balance: 0 }
    }
  }
}

function round2(x: number) {
  return Math.round(x * 100) / 100
}
function formatCNY(n: number) {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 2 }).format(n)
}
</script>
