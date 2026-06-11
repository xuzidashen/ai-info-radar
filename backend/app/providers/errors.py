class ProviderConfigurationError(RuntimeError):
    """Provider is selected but required backend configuration is missing."""


class ProviderRuntimeError(RuntimeError):
    """Provider request failed after configuration was accepted."""

