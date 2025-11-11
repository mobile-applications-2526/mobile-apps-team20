import DropdownInput from "@/components/shared/drop_down_input";
import { FilterTag, FilterTagLabel } from "@/domain/model/enums/filter_tag";
import { useEventFilterStore } from "@/store/events/use_event_filter_store";
import { useEventStore } from "@/store/events/use_event_store";

export function useEventFilter({
  onClose
}:{
  onClose: () => void
}):[string, () => React.ReactNode][] {

  const fetchOtherEvents = useEventStore(state => state.fetchOtherEvents);
  const setSelectedFilter = useEventFilterStore(state => state.setFilterState)

  const filterOptions: [string, () => React.ReactNode][] = [
      [
        FilterTagLabel[FilterTag.Location],
        () => (
          <DropdownInput
            label="Introduce a location"
            onSubmit={(value) => {
              const trimmed = value.trim();
              if (!trimmed) return;

              // Update the filter state
              setSelectedFilter(FilterTag.Location)
            
              // Trigger async fetch from repository
              fetchOtherEvents(async (repo) => {
                  const events = await repo.getEventsByLocation(trimmed);
                  return events;
              });

              onClose();
          }}
          onCancel={() => onClose()}
          />
        ),
      ],

      [
        // TODO: Format date & create another component for it
        FilterTagLabel[FilterTag.Date],
          () => (
            <DropdownInput
              label="Enter a date (YYYY-MM-DD)"
              onSubmit={(value) => {
                const trimmed = value.trim();
                if (!trimmed) return;

                // Update filter state
                setSelectedFilter(FilterTag.Date)

                fetchOtherEvents(async (repo) => {
                  const events = await repo.getEventsByDateAscending(trimmed);
                  return events;
                });

                onClose();
              }}
              onCancel={() => onClose()}
            />
          ),
      ],
  ];
  return filterOptions
}