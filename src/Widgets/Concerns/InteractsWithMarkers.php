<?php

namespace NWNSoftware\Maplibre\Widgets\Concerns;

trait InteractsWithMarkers
{
    /**
     * Triggered when the user clicks an event.
     *
     * @param  array  $event  An Event Object that holds information about the event (date, title, etc).
     */
    public function onEventClick(int | string $id): void
    {
        if ($this->getModel()) {
            $this->record = $this->resolveRecord($id);
        }

        $this->mountAction('view', [
            'type' => 'click',
        ]);

    }
}
