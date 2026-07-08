import {render, screen, fireEvent} from '@testing-library/react'
import ApiCard from './apiCard'

describe('ApiCard', () => {
  it('renders the apiName as a button and fires clickFunction', () => {
    const onClick = jest.fn()
    render(<ApiCard apiName="Do Thing" clickFunction={onClick} />)

    const button = screen.getByRole('button', {name: 'Do Thing'})
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies a mapped height class', () => {
    render(<ApiCard apiName="Tall" clickFunction={() => {}} height={24} />)
    expect(screen.getByRole('button', {name: 'Tall'}).className).toContain('h-24')
  })

  it('falls back to h-16 for an unmapped height', () => {
    render(<ApiCard apiName="Default" clickFunction={() => {}} height={999} />)
    expect(screen.getByRole('button', {name: 'Default'}).className).toContain('h-16')
  })

  it('uses the provided color class when given', () => {
    render(<ApiCard apiName="Red" clickFunction={() => {}} color="bg-red-700" />)
    expect(screen.getByRole('button', {name: 'Red'}).className).toContain('bg-red-700')
  })
})
