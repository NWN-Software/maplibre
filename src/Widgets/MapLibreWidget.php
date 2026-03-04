<?php

namespace NWNSoftware\Maplibre\Widgets;

use Filament\Actions\Action;
use Filament\Actions\Concerns\InteractsWithActions;
use Filament\Actions\Contracts\HasActions;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Schemas\Schema;
use Filament\Widgets\Widget;
use NWNSoftware\Maplibre\Actions\ViewAction;
use NWNSoftware\Maplibre\Widgets\Concerns\InteractsWithMarkers;
use NWNSoftware\Maplibre\Widgets\Concerns\InteractsWithRecords;

class MapLibreWidget extends Widget implements HasActions, HasForms
{
    use InteractsWithActions;
    use InteractsWithForms;
    use InteractsWithMarkers;
    use InteractsWithRecords;

    protected string $view = 'maplibre::maplibre';

    protected int | string | array $columnSpan = 'full';

    protected array $center = [0, 0];

    protected int $zoom = 5;

    protected bool $allowFullscreen = true;

    public function getMarkers(?array $detail = null): array
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
        return ViewAction::make();
    }

    public function getInfolistSchema(Schema $schema): Schema
    {
        return $schema
            ->components([
            ]);
    }

    public function getFormSchema(): array
    {
        return [];
    }
}
