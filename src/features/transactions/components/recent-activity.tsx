import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const recentActivities = [
  {
    id: 1,
    description: 'Maintenance request submitted by John Doe (Unit A-302)',
    timestamp: '5 minutes ago',
    avatar: '/avatars/01.png',
    initials: 'JD',
  },
  {
    id: 2,
    description: 'Payment received from Mary Jane (Unit B-104)',
    timestamp: '45 minutes ago',
    avatar: '/avatars/02.png',
    initials: 'MJ',
  },
  {
    id: 3,
    description: 'New tenant registered: Michael Smith (Unit C-209)',
    timestamp: '2 hours ago',
    avatar: '/avatars/03.png',
    initials: 'MS',
  },
  {
    id: 4,
    description: 'Lease renewed by Anna Bell (Unit D-407)',
    timestamp: '4 hours ago',
    avatar: '/avatars/04.png',
    initials: 'AB',
  },
  {
    id: 5,
    description: 'Inspection completed: Property Greenview Apartments',
    timestamp: '1 day ago',
    avatar: '/avatars/05.png',
    initials: 'GV',
  },
]

export function RecentActivity() {
  return (
    <div className='space-y-4'>
      {recentActivities.map((activity) => (
        <div key={activity.id} className='flex items-center space-x-4'>
          <Avatar>
            <AvatarImage src={activity.avatar} alt={activity.initials} />
            <AvatarFallback>{activity.initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className='text-sm font-medium'>{activity.description}</p>
            <p className='text-muted-foreground text-xs'>
              {activity.timestamp}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecentActivity
