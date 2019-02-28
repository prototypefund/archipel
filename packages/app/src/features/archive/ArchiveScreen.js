import React, { useEffect } from 'react'

import { MdMenu, MdClose, MdSubdirectoryArrowLeft } from 'react-icons/md'
import { Consumer } from 'ucore/react'

import { Modal } from '@archipel/ui'

import { useToggle } from '../../lib/hooks'
import { useRouter, Link, getElements } from '../../lib/router'

import ListArchives from './ListArchives'
import AuthorizationMenu from './AuthorizationMenu'
import CreateArchive from './CreateArchive'
import AddArchive from './AddArchive'

export default function ArchiveScreen (props) {
  const { children } = props
  const { params, goto, route } = useRouter()

  // todo: Change onSelect syntax in List to be a single function.
  return <ArchiveUcoreLoader Render={ArchiveScreen} changeprop={params.archive} changeprop2={route} />

  function ArchiveScreen (props) {
    const { archives, selected, onSelect } = props

    useEffect(() => {
      if (params.archive !== archive) onSelect(params.archive)
    }, [params.archive])

    const archive = selected ? selected.key : null

    return (
      <div className='flex flex-1'>
        <div className='flex-no-shrink w-65'>
          <ArchiveGlobalActions />
          <ArchiveList archives={archives} selected={selected} onSelect={onArchiveSelect} />
        </div>
        <div className='flex-1 p-4'>
          { !archive && <NoArchive /> }
          { archive && <ArchiveAppScreen archive={archive} loadedArchive={selected} children={children} /> }
        </div>
      </div>
    )

    function onArchiveSelect (item, i) {
      return (e) => {
        onSelect(item.key)
        goto('archive/' + item.key)
      }
    }
  }
}

function NoArchive (props) {
  return (
    <div className='p-16 md:w-1/2 mx-auto my-auto'>
      <div className='my-8 text-center'>
        <img className='mr-6' src='/archipel-logo-1.svg' />
        <div className='text-5xl font-bold'>Archipel</div>
      </div>
      <div className='text-3xl text-grey italic text-center'>
        <span className='text-4xl'><MdSubdirectoryArrowLeft /></span>
        <br />
        No archive selected.
        <br />
        Chose or create an archive at the left!
      </div>
    </div>
  )
}

function ArchiveList (props) {
  const { archives, selected, onSelect } = props
  return (
    <>
      <ListArchives
        archives={archives}
        isSelected={item => item === selected}
        onSelect={onSelect}
      />
    </>
  )
}

function ArchiveGlobalActions (props) {
  return (
    <>
      <div className='mb-4'>
        <Modal toggle='New archive'>
          <CreateArchive />
        </Modal>
      </div>
      <div className='mb-4'>
        <Modal toggle='Grant access'>
          <AuthorizationMenu />
        </Modal>
      </div>
    </>
  )
}

function ArchiveActions (props) {
  const { archive } = props
  let actions = getElements('archive').actions
  return (
    <div className='flex'>
      {actions.map((action, i) => (
        <Link key={i} link={action.href} params={{ archive }}>
          <ActionLink name={action.name} Icon={action.icon} />
        </Link>
      ))}
    </div>
  )
}

export function ActionLink (props) {
  let { Icon, name, color } = props
  color = color || 'pink'
  let clsHeader = `cursor-pointer flex text-lg text-${color} mx-2`
  return (
    <div className={clsHeader}>
      { Icon && <Icon className='mr-1 w-8 flex-0' size={24} /> }
      <span className='self-center'>{name}</span>
    </div>
  )
}

function ArchiveTabLinks () {
  const { route } = useRouter()

  let links = getElements('archive/:archive').link
  if (!links || !links.length) return null
  links = links.sort((a, b) => (a.weight || 0) > (b.weight || 0) ? 1 : -1)
  let color = 'pink'
  let lcls = `list-reset border-${color} border-r`

  return (
    <ul className={lcls}>
      {links.map((el, i) => <TabEl key={i} el={el} />)}
    </ul>
  )

  function TabEl (props) {
    const { el } = props
    let color = 'pink'
    let cls = `p-2 cursor-pointer text-${color}-dark`
    if (el.href === route || el.href + '/*' === route) cls += ` bg-${color}-lightest`
    else cls += ` hover:bg-${color}-lightest`
    return (
      <Link link={el.href}>
        <li className={cls}>
          {el.name}
        </li>
      </Link>
    )
  }
}

function ArchiveAppScreen (props) {
  const { archive, loadedArchive, children } = props
  // const [menu, toggleMenu] = useToggle(true)

  let color = 'pink'
  let cls = `border-${color} border flex bg-white`
  let hcls = `border-${color} border-b text-2xl m-0 px-2 py-4 text-${color} flex`

  // let MenuIcon = menu ? MdClose : MdMenu
  // <span onClick={e => toggleMenu()} className='cursor-pointer'><MenuIcon /></span>

  return (
    <div className={cls}>
      <div className='flex-1'>
        <div className={hcls}>
          <h2 className='text-2xl flex-1'>
            {loadedArchive.info.title}
          </h2>
          <div className=''>
            <ArchiveActions archive={archive} />
          </div>
        </div>
        <div className='flex'>
          <ArchiveTabLinks />
          <div className='flex-1'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function ArchiveUcoreLoader (props) {
  const { Render, ...rest } = props
  return (
    <Consumer store='archive' select={['sortedByName', 'selectedArchive']} {...rest}>
      {([archives, selectedArchive], store) => {
        if (!store.get().started) store.loadArchives()
        return <Render archives={archives} selected={selectedArchive} onSelect={store.selectArchive} />
      }}
    </Consumer>
  )
}
