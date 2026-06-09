import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export interface DateTimePickerProps {
  value?: string | Date | null
  onChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DateTimePicker({ value, onChange, placeholder = "Chọn ngày giờ" }: DateTimePickerProps) {
  const parsedDate = value ? new Date(value) : undefined
  const [selectedDateTime, setSelectedDateTime] = React.useState<Date | undefined>(parsedDate)

  React.useEffect(() => {
    setSelectedDateTime(value ? new Date(value) : undefined)
  }, [value])

  const handleSelect = (day: Date | undefined) => {
    if (!day) return
    const newDate = new Date(selectedDateTime || new Date())
    newDate.setFullYear(day.getFullYear())
    newDate.setMonth(day.getMonth())
    newDate.setDate(day.getDate())
    setSelectedDateTime(newDate)
    onChange(newDate)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    if (!time) return
    const [hours, minutes] = time.split(':')
    const newDate = new Date(selectedDateTime || new Date())
    newDate.setHours(parseInt(hours))
    newDate.setMinutes(parseInt(minutes))
    setSelectedDateTime(newDate)
    onChange(newDate)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-bg-secondary border border-border-color hover:bg-bg-secondary hover:text-text-main",
            !selectedDateTime && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDateTime ? format(selectedDateTime, "dd/MM/yyyy HH:mm") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDateTime}
          onSelect={handleSelect}
        />
        <div className="p-3 border-t border-border-color">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Giờ:</span>
            <Input
              type="time"
              value={selectedDateTime ? format(selectedDateTime, "HH:mm") : ""}
              onChange={handleTimeChange}
              className="w-full text-sm h-9 cursor-pointer"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
