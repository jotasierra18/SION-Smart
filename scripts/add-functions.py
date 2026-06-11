with open('app/actions/data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

additional_functions = """
// Additional dashboard functions
export async function getClientStats() {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  
  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, companyName, nombreCompleto')
    .order('createdAt', { ascending: false })
    .limit(5)
  
  if (error) throw error
  return clients || []
}

export async function getOperatorPerformance() {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  
  const { data: operators, error } = await supabase
    .from('user')
    .select('id, name, role')
    .eq('role', 'operator')
    .order('createdAt', { ascending: false })
  
  if (error) throw error
  
  return (operators || []).map((op: any) => ({
    id: op.id,
    name: op.name,
    completedFlights: 0,
    totalHours: 0,
    efficiency: 0,
  }))
}

export async function getMonthlyStats() {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  
  const { data: requests, error } = await supabase
    .from('service_requests')
    .select('createdAt, status')
    .gte('createdAt', sixMonthsAgo.toISOString())
  
  if (error) throw error
  
  const monthlyData = new Map()
  if (requests) {
    requests.forEach((req: any) => {
      const month = new Date(req.createdAt).toISOString().slice(0, 7)
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { month, requests: 0, completed: 0 })
      }
      const data = monthlyData.get(month)
      data.requests++
      if (req.status === 'completed') data.completed++
    })
  }
  
  return Array.from(monthlyData.values()).sort((a: any, b: any) => a.month.localeCompare(b.month))
}
"""

content = content + additional_functions

with open('app/actions/data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Added missing functions')
