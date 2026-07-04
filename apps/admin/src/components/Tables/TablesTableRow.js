// TablesTableRow.jsx
import { Td, Tr, useColorModeValue } from '@chakra-ui/react'

const TablesTableRow = ({
  row,
  columnKeys,
  renderers = {},
  renderActions,
  columnWidths = {},
  isScrolled, // pass from parent
  checkboxComponent,
  actionsStickyLeft = false,
  hasCheckbox = false,
  actionsColumnWidth = '180px',
  stickyDivider,
  stickyShadow,
  stickyRightColumnKeys = [],
  stickyRightOffsets = {},
}) => {
  const bg = useColorModeValue('#FFFFFF', '#161B22')
  const borderColor = useColorModeValue('#E2E8F0', '#30363D')

  return (
    <Tr>
      {checkboxComponent}
      {columnKeys.map((key, idx) => {
        const value = row[key]
        const content = renderers[key] ? renderers[key](value, row) : value
        const isLastDataColumn = idx === columnKeys.length - 1

        return (
          <Td
            key={idx}
            ps={5}
            pe={isLastDataColumn && renderActions ? 8 : 5}
            minW={columnWidths[key] || 'auto'}
            maxW={columnWidths[key] || 'auto'}
            overflow="visible"
            position={stickyRightColumnKeys.includes(key) ? 'sticky' : 'static'}
            right={stickyRightColumnKeys.includes(key) ? stickyRightOffsets[key] || 0 : undefined}
            zIndex={stickyRightColumnKeys.includes(key) ? 2 : undefined}
            bg={stickyRightColumnKeys.includes(key) ? bg : undefined}
            borderColor={borderColor}
            py="18px"
            boxShadow={
              stickyRightColumnKeys.includes(key) && (stickyRightOffsets[key] || 0) === 0
                ? '-6px 0 10px rgba(1, 4, 9, 0.25)'
                : undefined
            }
          >
            {content ?? '—'}
          </Td>
        )
      })}

      {renderActions && (
        <Td
          px={5}
          minW={actionsColumnWidth}
          w={actionsColumnWidth}
          bg={bg}
          position="sticky"
          {...(actionsStickyLeft ? { left: hasCheckbox ? 56 : 0 } : { right: 0 })}
          zIndex={3}
          overflow="visible"
          whiteSpace="nowrap"
          borderLeft="1px solid"
          borderColor={stickyDivider || borderColor}
          boxShadow={stickyShadow}
        >
          {renderActions(row)}
        </Td>
      )}
    </Tr>
  )
}

export default TablesTableRow
