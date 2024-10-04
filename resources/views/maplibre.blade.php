@php
    $plugin = \NWNSoftware\MapLibre\MapLibrePlugin::get();
@endphp

<x-filament-widgets::widget>
    <x-filament::section>
        <div class="maplibre " wire:ignore ax-load
            ax-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('maplibre-alpine', 'nwn-software/maplibre') }}"
            ax-load-css="{{ \Filament\Support\Facades\FilamentAsset::getStyleHref('maplibre-styles', 'nwn-software/maplibre') }}"
            x-ignore x-data="maplibre({
                locale: @js($plugin->getLocale()),
                container: @js($this->getId()),
                style: @js($plugin->getStyle()),
                center: @js($this->getCenter()),
                zoom: @js($this->getZoom()),
                allowFullscreen: @js($this->getAllowFullscreen()),
            })">

            <div id="{{ $this->getId() }}" class="w-full h-screen" x-ref="map">

            </div>


        </div>


    </x-filament::section>

    <x-filament-actions::modals />
</x-filament-widgets::widget>
