import { getProfile } from '@/app/actions/profile'
import { getFeedback } from '@/app/actions/feedback'
import { redirect } from 'next/navigation'
import FeedbackClient from './feedback-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FeedbackPage() {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }

  // Fetch all feedbacks
  const feedbacks = await getFeedback('all')

  return <FeedbackClient profile={profile} initialFeedbacks={feedbacks} />
}
