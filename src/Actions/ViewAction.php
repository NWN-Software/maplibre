<?php

namespace NWNSoftware\Maplibre\Actions;

use Filament\Schemas\Schema;
use Filament\Actions\ViewAction as BaseViewAction;
use NWNSoftware\Maplibre\Widgets\MapLibreWidget;

class ViewAction extends BaseViewAction
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->model(
            fn (MapLibreWidget $livewire) => $livewire->getModel()
        );

        $this->record(
            fn (MapLibreWidget $livewire) => $livewire->getRecord()
        );

        $this->schema(
            fn (MapLibreWidget $livewire, Schema $schema): Schema => $livewire->getInfolistSchema($schema)
        );

        $this->cancelParentActions();
    }
}
