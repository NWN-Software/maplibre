# Package to display maps using MapLibre

[![Latest Version on Packagist](https://img.shields.io/packagist/v/nwn-software/maplibre.svg?style=flat-square)](https://packagist.org/packages/nwn-software/maplibre)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/nwn-software/maplibre/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/nwn-software/maplibre/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/nwn-software/maplibre/fix-php-code-styling.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/nwn-software/maplibre/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/nwn-software/maplibre.svg?style=flat-square)](https://packagist.org/packages/nwn-software/maplibre)



This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Installation

You can install the package via composer:

```bash
composer require nwn-software/maplibre
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="maplibre-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="maplibre-config"
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="maplibre-views"
```

This is the contents of the published config file:

```php
return [
];
```

## Usage

```php
$maplibre = new NWNSoftware\Maplibre();
echo $maplibre->echoPhrase('Hello, NWNSoftware!');
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [nwnsoftware](https://github.com/NWN-Software)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
