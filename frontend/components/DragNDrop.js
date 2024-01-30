import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from "react-sortable-hoc";

const DragHandle = sortableHandle(() => <span className="drag"></span>);

export const SortableContainer = sortableContainer(({ children }) => {
  return <tbody>{children}</tbody>;
});

export const SortableItem = sortableElement(({ data, tableData }) => {
  return (
    <>
      <tr>
        <td className="pl-0 py-5">
          <DragHandle />
        </td>
        {tableData.map((tData, index) => {
          let value = data[tData];
          return (
            <td key={index} className="py-5">
              <div className="d-flex align-items-center">
                <div className="text-dark-75 mb-1  font-size-lg">{value}</div>
              </div>
            </td>
          );
        })}
      </tr>
    </>
  );
});
