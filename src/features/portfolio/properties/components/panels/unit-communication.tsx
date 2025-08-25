'use client'

import * as React from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  pid: string
  uid: string
  unit: any
  onClose?: () => void
}

export function UnitCommunicationPanel({ pid, uid, unit, onClose }: Props) {
  const [channel, setChannel] = React.useState<'sms' | 'email'>('sms')
  const [to, setTo] = React.useState<string>((unit as any).tenantPhone ?? '')
  const [subject, setSubject] = React.useState<string>('')
  const [body, setBody] = React.useState<string>('')

  React.useEffect(() => {
    if (channel === 'sms') setTo((unit as any).tenantPhone ?? '')
    if (channel === 'email') setTo((unit as any).tenantEmail ?? '')
  }, [channel, unit])

  const send = () => {
    // wire to your messaging service (Infobip, SES, etc.)
    // await sendMessage({ pid, uid, channel, to, subject, body })
  }

  return (
    <div className='flex min-h-[60vh] flex-col gap-4'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <MessageSquare className='h-4 w-4' />
          <span className='text-sm font-medium'>
            Communicate • Unit #{unit.unitIdentifier}
          </span>
          <Badge variant='secondary' className='hidden sm:inline'>
            {channel.toUpperCase()}
          </Badge>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant={channel === 'sms' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setChannel('sms')}
          >
            SMS
          </Button>
          <Button
            variant={channel === 'email' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setChannel('email')}
          >
            Email
          </Button>
        </div>
      </div>

      <Separator />

      <div className='grid gap-3'>
        <div className='grid gap-2'>
          <Label htmlFor='to'>To</Label>
          <Input
            id='to'
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder='+2547… or tenant@email.com'
          />
        </div>

        {channel === 'email' && (
          <div className='grid gap-2'>
            <Label htmlFor='subject'>Subject</Label>
            <Input
              id='subject'
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        )}

        <div className='grid gap-2'>
          <Label htmlFor='body'>Message</Label>
          <Textarea
            id='body'
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
          />
        </div>

        <div className='flex items-center justify-end gap-2'>
          <Button variant='ghost' onClick={onClose}>
            Close
          </Button>
          <Button onClick={send}>
            <Send className='mr-2 h-4 w-4' />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
