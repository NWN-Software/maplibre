<?php

namespace NWNSoftware\Maplibre\Widgets;

use Filament\Actions\Action;
use Filament\Actions\Concerns\InteractsWithActions;
use Filament\Actions\Contracts\HasActions;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Infolists\Infolist;
use Filament\Widgets\Widget;
use NWNSoftware\Maplibre\Actions;

class MapLibreWidget extends Widget implements HasActions, HasForms
{
    use Concerns\InteractsWithMarkers;
    use Concerns\InteractsWithRecords;
    use InteractsWithActions;
    use InteractsWithForms;

    protected static string $view = 'maplibre::maplibre';

    protected int | string | array $columnSpan = 'full';

    protected array $center = [0, 0];

    protected int $zoom = 5;

    protected bool $allowFullscreen = true;

    public function getMarkers(): array
    {
        return [];
    }

    public function getSources(): array
    {
        return [];
    }

    public function getLayers(): array
    {
        return [];
    }

    public function getLegend(): array
    {
        return [];
    }

    protected function getCenter(): array
    {
        return $this->center;
    }

    protected function getZoom(): int
    {
        return $this->zoom;
    }

    protected function getAllowFullscreen(): bool
    {
        return $this->allowFullscreen;
    }

    protected function viewAction(): Action
    {
        return Actions\ViewAction::make();
    }

    public function getInfolistSchema(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
            ]);
    }

    public function getFormSchema(): array
    {
        return [];
    }
}
