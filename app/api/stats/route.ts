import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  let db = { users: [], assets: [] }
  const dbData = cookies().get('app_db')?.value
  if (dbData) {
    try { db = JSON.parse(dbData) } catch (e) {}
  }
  
  const baseUsers = 600
  const totalUsers = baseUsers + (db.users?.length || 0)
  
  // Base assets 200K (200000)
  let totalAssetsValue = 200000
  if (db.assets && Array.isArray(db.assets)) {
    for (const asset of db.assets) {
      if (asset.quantity && asset.averagePrice) {
        totalAssetsValue += (asset.quantity * asset.averagePrice)
      }
    }
  }

  let formattedAssets = ''
  if (totalAssetsValue >= 1000000) {
    formattedAssets = `R$ ${(totalAssetsValue / 1000000).toFixed(1)}M+`
  } else if (totalAssetsValue >= 1000) {
    formattedAssets = `R$ ${(totalAssetsValue / 1000).toFixed(0)}K+`
  } else {
    formattedAssets = `R$ ${totalAssetsValue.toFixed(0)}+`
  }

  return NextResponse.json({ 
    investors: `+${totalUsers}`, 
    patrimony: formattedAssets 
  })
}
